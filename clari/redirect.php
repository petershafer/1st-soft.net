<?php
header("HTTP/1.0 301 Moved Permanently");
$page = explode("/",$_SERVER['REQUEST_URI']);
array_shift($page);
array_shift($page);
$page = implode("/",$page);
$page = "http://www.clarabelle.net/".$page;
header("location: $page");
?>