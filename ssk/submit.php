<?php

function sendTags($term){
	
}

$mobile = (boolean)$_POST["forward"];
$term = $_POST["term"];

if($mobile == true){
	$site = "";
	switch($_POST["mode"]){
		case "osha":
			$site = "site:www.osha.gov ";
			break;
		case "msha":
			$site = "site:www.msha.gov ";
			break;
		case "niosh":
			$site = "site:www.cdc.gov/niosh ";
			break;
	}
	sendTags($term);
	header("Location: http://www.google.com/m?q=".$site.$term); 
}else{
	
}

?>
