<table width="100%" height="100%" border="0"><tr><td valign="middle"><center>

<?php

$places = array();
$places[] = "Perkins";
$places[] = "Imperial Chinese Buffet";
$places[] = "Kentucky Fried Chicken";
$places[] = "Hoss's Steak & Sea House";
$places[] = "Subway";
$places[] = "Number 1 China Buffet";
$places[] = "Pittsburgh Bagel & Coffee Company";
$places[] = "Pizza Hut";
$places[] = "Taco Bell";
$places[] = "Dairy Queen";
$places[] = "Arby's";
$places[] = "Pizza From Mars";
$places[] = "Super China Buffet";
$places[] = "Whole Darn Thing Sub Shops";
$places[] = "McDonald's";
$places[] = "Little Caesars Pizza";
$places[] = "Wendy's";
$places[] = "Burger King";
$places[] = "Compadres";
$places[] = "Eddie's Footlong Hot Dogs";
$places[] = "Julian's";
$places[] = "The Pampered Pallete";
$places[] = "Quiznos";
$places[] = "The Artist's Cup Cafe";
$places[] = "Sheetz";
$places[] = "Taj M'Sheetz";
$places[] = "Yuen's Garden";
$places[] = "McKinleys";

//$places[] = "";


if(!isset($_GET[all])){

echo"THE INTERNET has determined that you will eat at...<p><font style=\"font-size: 72px; font-family: impact; font-weight: bold;\">";

echo $places[rand(0,count($places)-1)];

echo"</font></p>";

echo"If THE INTERNET has chosen poorly, <a href=\"index.php?all=yes\">pick your own</a>, or visit <a href=\"http://local.yahoo.com\">local.yahoo.com</a>.";

echo"<h2>All decisions made by <b>THE INTERNET</b> are final and <u>legally binding!</u></h2>";

}else{

for($i = 0; $i < count($places); $i++){
echo"<ul>$places[$i]</ul>";
}

}

?>


</center></td></tr></table>
