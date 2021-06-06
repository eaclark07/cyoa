// SET CHARACTER LIMITS HERE
var minChars = 20, maxChars = 260;
// THESE VARIABLES KEEP TRACK OF THE TASK RESPONSES
var userLines = "", userEdits = "", baselineLines = "", modelLines = "", chosenSuggs = "";
var modelLoc;
var isModelChosen;
var roundsCompleted = 0;
var onWritingSection = true;


function countRounds() {
    var last_section = "switchSections"+MAX_STORY_LINES-1;
    if (roundsCompleted < MAX_STORY_LINES) {
	document.getElementById("validateButton").disabled = "true";
    } else if (roundsCompleted == MAX_STORY_LINES) {
	document.getElementById("validateButton").disabled = "";
	document.getElementById(last_section).disabled = "true";
	document.getElementById("charCountMessage").style.display = "none";
    } else {
	document.getElementById("validateButton").disabled = "";
    }
}


function showInstructions(){
    document.getElementById("beforeAnything").style.display = "none";
    document.getElementById("main").style.display = "block";
}


function showWritingTask(){
    document.getElementById("writing").style.display = "block";
    document.getElementById("IhaveReadTheInstructions").style.display = "none";
}


function countChars() {
    document.getElementById("short_msg")
	.innerHTML = "Too short! ("+minChars+" character min.)";
    document.getElementById("long_msg")
	.innerHTML = "Too long! ("+maxChars+" character max.)";

    var textField = "submission";
    var button = "switchSections"; 
	textField += roundsCompleted;
	button += roundsCompleted;
    if (document.getElementById(textField) == null)
	return;
    var len = document.getElementById(textField).textContent.length;
    document.getElementById("charcount").innerHTML = len;

    if (roundsCompleted < MAX_STORY_LINES ) {
	if (len < minChars) {
            document.getElementById("short_msg").style.display = "";
	    document.getElementById("long_msg").style.display = "none";
	    document.getElementById(button).disabled = "true";
	    document.getElementById("end_msg").style.display = "none";
	} else if (len > maxChars) {
            document.getElementById("short_msg").style.display = "none";
	    document.getElementById("long_msg").style.display = "";
	    document.getElementById(button).disabled = "true";
	    document.getElementById("end_msg").style.display = "none";
	} else {
	    if (roundsCompleted < MAX_STORY_LINES ) {
		document.getElementById("short_msg").style.display = "none";
		document.getElementById("long_msg").style.display = "none";
		document.getElementById(button).disabled = false;
		document.getElementById("end_msg").style.display = "none";
		
	    } else {
		document.getElementById("short_msg").style.display = "none";
		document.getElementById("long_msg").style.display = "none";
		document.getElementById(button).disabled = "true";
		document.getElementById("end_msg").style.display = "";
	    }
   	}
    }
}


window.onload = function() {
    msg = document.getElementById("message");
   	for(i=0; i < MAX_STORY_LINES; i++) {
	    var target = document.getElementById("submission"+i);
	    target.addEventListener("keydown", countChars);
	    target.addEventListener("keyup", countChars);
	    target.addEventListener("mouseout", countChars);
	    document.getElementById("switchSections"+i)
		.addEventListener("click",countChars);
	}
   }


function switchSections(round){
    /* Called at the submission of a line in the text box.
     round is the one that we just finished;
     nextRound is the next one
    */
    
    var nextRound = round+1;
    var storyText = document.getElementById("story");
    var inputText = document.getElementById("submission"+round).textContent;

    if (roundsCompleted != 0) {
	storyText.innerHTML += "<br>";
    storyText.innerHTML += inputText;
    }
	document.getElementById("subFinal"+round).innerHTML += inputText;
        document.getElementById("submission"+round).style.display = "none";
        document.getElementById("subFinal"+round).style.display = "";
        document.getElementById("switchSections"+round).style.display = "none";
	if (roundsCompleted != MAX_STORY_LINES-1){
	    document.getElementById("submission"+nextRound).style.display = "";
	    location.href = "#";
	    location.href = "#"+"submission"+nextRound;
	    document.getElementById("switchSections"+nextRound).style.display = "";
    }
    if (onWritingSection){
	document.getElementById("submission"+round).textContent = "";
	    onWritingSection = false;
	    userLines += "@";
	    userLines += inputText;
	    document.getElementById("modelOptions"+round).style.display = "";
        document.getElementById("part1").style.display="none";
	    document.getElementById("part2").style.display="";
        promptTarget = document.getElementById("submission"+nextRound);
	    promptTarget.style.display = "none";
        document.getElementById("switchSections"+nextRound).style.display="none";
        document.getElementById("charCountMessage").style.display="none";
        var random_boolean = Math.random() >= 0.5;  // randomly decide model order
        if (random_boolean) {    
            ATarget = document.getElementById("model1sugg"+round);
	        BTarget = document.getElementById("model2sugg"+round);
            modelLoc = 1;
        } else {
            BTarget = document.getElementById("model1sugg"+round);
	        ATarget = document.getElementById("model2sugg"+round);       
            modelLoc = 0;
        }
           promptTarget.textContent = "Please select an option above.";
            document.getElementById("switchSections"+round).disabled = true;
            var storySoFar = storyText.innerHTML;
            storySoFar = cleanupText(storySoFar);
            storySoFar = storySoFar.replace(/\<br\>/g,"@");
            getAComputerLine(storySoFar,ATarget,BTarget,nextRound);
            getBComputerLine(storySoFar,BTarget,ATarget,nextRound);
    } else {
	onWritingSection = true;
	document.getElementById("part1").style.display="";
	document.getElementById("part2").style.display="none";

	document.getElementById("modelOptions"+(parseInt(round)-1).toString()).style.display="none";
	userEdits += "@";
	userEdits += inputText;
    chosenSuggs += ",";
    chosenSuggs += isModelChosen.toString();
	document.getElementById("submission"+round).textContent = "";
    }
    roundsCompleted++;
    countRounds();

    var counterMessage = "Your Story: ("+roundsCompleted+" ";
    counterMessage += (roundsCompleted == 1)? "Turn":"Turns";
    counterMessage += " Completed)";
    if ((roundsCompleted >= MAX_STORY_LINES - 2) && (roundsCompleted < MAX_STORY_LINES)) {
	counterMessage += ". Warning: Only "+(MAX_STORY_LINES-roundsCompleted)+" left!";
    }
    document.getElementById("story-header").textContent = counterMessage;
}


function addSugg1(round) {
	nextRound = (parseInt(round)+1).toString();
	promptTarget = document.getElementById("submission"+nextRound);
    promptTarget.style.display="";
	document.getElementById("switchSections"+nextRound).style.display="";
    document.getElementById("charCountMessage").style.display="";
    promptTarget.textContent = document.getElementById("model1sugg"+round).textContent;
    isModelChosen = !(modelLoc);
    document.getElementById("switchSections"+round).disabled = false;
}


function addSugg2(round) {
	nextRound = (parseInt(round)+1).toString();
    promptTarget = document.getElementById("submission"+nextRound);
    promptTarget.style.display = "";
    document.getElementById("switchSections"+nextRound).style.display="";
    document.getElementById("charCountMessage").style.display="";
    promptTarget.textContent = document.getElementById("model2sugg"+round).textContent;
    isModelChosen = !(!(modelLoc));
    document.getElementById("switchSections"+round).disabled = false;
}


// REPLACE THIS WITH CODE TO GENERATE FROM THE BASELINE MODEL
function getAComputerLine(story, target, otherTarget, nextRound){
    baselineLines += "@BASELINE";
    target.textContent = "BASELINE";
        document.getElementById("choose1"+parseInt(nextRound-1)).disabled = false;
        document.getElementById("choose2"+parseInt(nextRound-1)).disabled = false;
}


// REPLACE THIS WITH CODE TO GENERATE FROM YOUR MODEL
function getBComputerLine(story, target, otherTarget, nextRound){
    modelLines += "@MODEL";
    target.textContent = "MODEL";
        document.getElementById("choose1"+parseInt(nextRound-1)).disabled = false;
        document.getElementById("choose2"+parseInt(nextRound-1)).disabled = false;
}


function cleanupText(text){
    /*Cleans up HTML*/
    text = text.replace(/[\r\n|\n|\t]/gi," ");
    text = text.replace(/&nbsp;/gi," ");
    text = text.replace(/&/gi,"");
    return text;
}


function sendAnswers() {
    // FILL THIS IN WITH FUNCTION TO SEND AND STORE TASK RESPONSES
}
