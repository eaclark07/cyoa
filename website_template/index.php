<!DOCTYPE html>
<html lang=en>
<head>
<title>Interactive Storyteller</title>
<link rel="stylesheet" href="resources/bootstrap.min.css">
<link rel="stylesheet" href="resources/style.css">
<script src="resources/general.js"></script>
</head>

<body>
  <?php
     $MAX_STORY_LINES = 10;
    echo '<script>var MAX_STORY_LINES = '.$MAX_STORY_LINES.'; </script>';
     ?>

  <!--This is the actual writing part -->
  <div class="container-fluid">
    <div id="blanket"></div>
   <div id="beforeAnything" style="width:70%;">
      <h1>Task Title</h1>
      <p>Task introduction and instructions go here.</p>
      <input class="btn btn-primary" type="button" id="startTask" value="Get started!" style="display:block;" onclick='showInstructions();' />
      </div>
    <div class="section" id="main" style="display:none;">
      <h1>Title</h1>
      <p><b>Instructions:</b> Write in the following steps:<br> 
    <ul>
    <li><b>Step #1:</b> Write a sentence by yourself.</li>
    <li><b>Step #2:</b> Choose 1 of 2 suggestions to continue. Once you've chosen, edit the suggestion as much or as little as you wish.</li>
    </ul>
    </p> 
<div id="IhaveReadTheInstructions">
	<input class="btn btn-primary" type="button" id="showTask" value="Start writing!" onclick='showWritingTask()'>
      </div>
      <div id="writing" class="row" style="display: none;">
	<div class="col-xs-6 col-sm-6 col-md-8 col-lg-8">
          <!-- WRITING -->
          <div id="part1">
            <h3 id="task-message">Step #1: Write a sentence:</h3>
          </div>
          <!-- COMPUTER'S LINE -->
          <div id="part2" style="display:none;">
            <h3>Step #2: Choose a suggestion to continue the story.<br> You can edit it as much as you like before adding it to the text.</h3>
          </div>

     <div id="actualTask" style="visibility:visible"> <!-- writing space -->
<?php  
       for ($i = 0; $i < $MAX_STORY_LINES; $i++){
     $display = $i==0? "block" : "none";
         $color = ($i % 2 == 1) ? ";background-color: rgba(40,96,144,.4)": "";         
     echo '<div id="submission'.$i.'" class="submission-writing" style="display:'.$display.';" contenteditable="true" data-ph="Write the next line here"></div>'."\n";
  echo ' '."\n";  echo '<div id="subFinal'.$i.'" class="well" style="display:none'.$color.'"></div>'."\n";
     echo '<div id="modelOptions'.$i.'" style="display:none">
  <div id="model1'.$i.'" class="box2"> <div id="model1sugg'.$i.'" class="well" contenteditable="false">Waiting for the model...<br></div> <input class="btn btn-primary" type="button" value="Edit Option 1" id="choose1'.$i.'" onclick="addSugg1('.$i.');" disabled/>
</div>
  <div id="model2'.$i.'" class="box2"> <div id="model2sugg'.$i.'" class="well" contenteditable="false">Waiting for the model...<br></div> <input class="btn btn-primary" type="button" value="Edit Option 2" id="choose2'.$i.'" onclick="addSugg2('.$i.');" disabled/> 
</div>
</div>'."\n";
            echo '<input class="btn btn-primary" type="button" id="switchSections'.$i.'" style="display:'.$display.'" value="Add Line to Story" onclick="switchSections('.$i.');" disabled/>'."\n";
       }
        ?>

        <p id="charCountMessage">Characters:
      <span id="charcount">0</span> <span class="red" id="short_msg">Too short!</span>
      <span class="red" id="long_msg" style="display:none;">Too long!</span>
      <span class="red" id="end_msg" style="display:none;">Story is at maximum length!</span> 
    </p>
      </div>

      <div id="nav_wrapper">
        Click here to submit the finished story:
        <!-- ADD YOUR OWN FUNCTION sendAnswers() TO STORE TASK RESULTS -->
        <input class="btn btn-primary" type='button' id='validateButton' value='Submit Story' onclick='sendAnswers();' disabled/>
      </div>
      <h3 id="story-header">Your Story: (0 Turns Completed)</h3>
      <div id="story" class="well well-lg"></div>
</div>
      </div>
      <div id="goodbye" style="display:none;">
<p><h3>Thanks for submitting!</h3></p>
     </div>
    </div>
  </div>
 
</body>
</html>
