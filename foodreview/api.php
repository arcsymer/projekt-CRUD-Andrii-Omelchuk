<?php
session_start();
require_once 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
function respond($data){ echo json_encode($data); exit; }
function requireAuth(){ if(!isset($_SESSION['user_id'])) respond(['error'=>'Not authorized']); return (int)$_SESSION['user_id']; }

switch($action){
    case 'get_user_info':
        $id = requireAuth();
        $stmt = $conn->prepare("SELECT id,username,registration_date FROM users WHERE id=?");
        $stmt->bind_param("i",$id); $stmt->execute(); $user=$stmt->get_result()->fetch_assoc();

        $stmt=$conn->prepare("SELECT COUNT(*) c FROM reviews WHERE user_id=?"); $stmt->bind_param("i",$id); $stmt->execute();
        $user['reviews_count']=$stmt->get_result()->fetch_assoc()['c'];

        $stmt=$conn->prepare("SELECT ROUND(AVG(rating),1) r FROM reviews WHERE user_id=?"); $stmt->bind_param("i",$id); $stmt->execute();
        $user['avg_rating']=$stmt->get_result()->fetch_assoc()['r']??0;

        respond($user);

    case 'login':
        $u=trim($_GET['username']??''); $p=trim($_GET['password']??'');
        if(!$u||!$p) respond(['error'=>'Fields required']);
        $stmt=$conn->prepare("SELECT * FROM users WHERE username=?"); $stmt->bind_param("s",$u); $stmt->execute(); $user=$stmt->get_result()->fetch_assoc();
        if(!$user) respond(['error'=>'Nieprawidłowy login']); 
        if(!password_verify($p,$user['password'])) respond(['error'=>'Nieprawidłowe hasło']);
        $_SESSION['user_id']=$user['id']; respond(['success'=>true]);

    case 'register':
        $u=trim($_GET['username']??''); $p=trim($_GET['password']??'');
        if(!$u||!$p) respond(['error'=>'Fields required']);
        $stmt=$conn->prepare("SELECT * FROM users WHERE username=?"); $stmt->bind_param("s",$u); $stmt->execute();
        if($stmt->get_result()->num_rows>0) respond(['error'=>'Username exists']);
        $hash=password_hash($p,PASSWORD_DEFAULT);
        $stmt=$conn->prepare("INSERT INTO users(username,password,registration_date) VALUES(?,?,NOW())");
        $stmt->bind_param("ss",$u,$hash); $stmt->execute();
        $_SESSION['user_id']=$conn->insert_id; respond(['success'=>true]);

    case 'logout':
        session_destroy(); respond(['success'=>true]);

    case 'update_profile':
        $id=requireAuth(); 
        $u=trim($_GET['username']??''); $p=trim($_GET['password']??'');
        if($u){ $stmt=$conn->prepare("UPDATE users SET username=? WHERE id=?"); $stmt->bind_param("si",$u,$id); $stmt->execute(); }
        if($p){ $hash=password_hash($p,PASSWORD_DEFAULT); $stmt=$conn->prepare("UPDATE users SET password=? WHERE id=?"); $stmt->bind_param("si",$hash,$id); $stmt->execute(); }
        respond(['success'=>true]);

    case 'user_reviews':
        $id=requireAuth();
        $stmt=$conn->prepare("SELECT * FROM reviews WHERE user_id=? ORDER BY visit_date DESC"); $stmt->bind_param("i",$id); $stmt->execute();
        $res=$stmt->get_result(); $data=[]; while($row=$res->fetch_assoc()) $data[]=$row; respond($data);

    case 'add_review':
        $id=requireAuth();
        $f=['dish_name','restaurant_name','restaurant_address','visit_date','rating','recommendation','with_what','comment'];
        foreach($f as $k) if(!isset($_GET[$k]) || $_GET[$k]==='') respond(['error'=>"Field $k required"]);
        $vals=array_map(fn($k)=>$_GET[$k],$f);
        $rating=intval($vals[4]); if($rating<1||$rating>10) respond(['error'=>'Rating 1-10']);
        $stmt=$conn->prepare("INSERT INTO reviews(user_id,dish_name,restaurant_name,restaurant_address,visit_date,rating,recommendation,with_what,comment) VALUES(?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("issssisss",$id,...$vals); $stmt->execute(); respond(['success'=>true]);

    case 'get_review':
        $id=requireAuth(); $rid=(int)$_GET['id'];
        $stmt=$conn->prepare("SELECT * FROM reviews WHERE id=? AND user_id=?"); $stmt->bind_param("ii",$rid,$id); $stmt->execute();
        $res=$stmt->get_result(); if($res->num_rows==0) respond(['error'=>'No access']); respond($res->fetch_assoc());

    case 'edit_review':
        $id=requireAuth(); $rid=(int)$_GET['id'];
        $fields=['dish_name','restaurant_name','restaurant_address','visit_date','rating','recommendation','with_what','comment'];
        $set=[]; $types=''; $vals=[];
        foreach($fields as $f){
            $key=str_replace('_','-',$f);
            if(isset($_GET[$key])){
                $set[]="$f=?";
                $types .= $f==='rating'?'i':'s';
                $vals[] = $_GET[$key];
            }
        }
        if($set){
            $stmt=$conn->prepare("UPDATE reviews SET ".implode(',',$set)." WHERE id=? AND user_id=?");
            $types.='ii'; $vals[]=$rid; $vals[]=$id;
            $stmt->bind_param($types,...$vals); $stmt->execute();
        }
        respond(['success'=>true]);

    case 'delete_review':
        $id=requireAuth(); $rid=(int)$_GET['id'];
        $stmt=$conn->prepare("DELETE FROM reviews WHERE id=? AND user_id=?"); $stmt->bind_param("ii",$rid,$id); $stmt->execute(); respond(['success'=>true]);

    case 'top_lists':
        $data=['mostVisited'=>[],'topDishes'=>[]];
        $res=$conn->query("SELECT restaurant_name,COUNT(*) as visits FROM reviews GROUP BY restaurant_name ORDER BY visits DESC LIMIT 10");
        while($row=$res->fetch_assoc()) $data['mostVisited'][]=$row;
        $res=$conn->query("SELECT dish_name,ROUND(AVG(rating),1) as avg_rating FROM reviews GROUP BY dish_name ORDER BY avg_rating DESC LIMIT 10");
        while($row=$res->fetch_assoc()) $data['topDishes'][]=$row;
        respond($data);

    case 'search_reviews':
        $q="%".($_GET['query']??'')."%";
        $stmt=$conn->prepare("SELECT dish_name,restaurant_name,rating FROM reviews WHERE dish_name LIKE ? OR restaurant_name LIKE ?");
        $stmt->bind_param("ss",$q,$q); $stmt->execute(); $res=$stmt->get_result();
        $data=[]; while($row=$res->fetch_assoc()) $data[]=$row; respond($data);

    default: respond(['error'=>'Unknown action']);
}
?>
