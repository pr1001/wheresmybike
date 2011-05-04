<?php

$url = "http://www.afac-amsterdam.nl/bikebase/page.php?category=item";
$data = $_REQUEST;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
$result = curl_exec($ch);
curl_close($ch);

/*
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
*/

if (strpos($result, "De fiets gezocht met deze gegevens is niet gevonden in de database.") !== false) {
  $atAFAC = array('success' => false);
} else {
  $atAFAC = array('success' => false);
}

header("Content-Type: application/json");
print json_encode($atAFAC);

?>