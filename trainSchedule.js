var firebaseConfig = {
    apiKey: "AIzaSyDXBPDth3L-C0wzoew2J8jVPA_VwildhJA",
    authDomain: "trainscheduler-37132.firebaseapp.com",
    databaseURL: "https://trainscheduler-37132.firebaseio.com",
    projectId: "trainscheduler-37132",
    storageBucket: "",
    messagingSenderId: "930664680185",
    appId: "1:930664680185:web:22828630910d4bba"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let trainAddObj = {};
let databaseURL = firebase.database();
let validInputs = true;

$(document).ready(function (eventReadyObj) {
    console.log(eventReadyObj);
    // Method triggers once at page load and runs every time a new child is added 
    databaseURL.ref("/trainschedules").on('child_added', function (snapObj) {
        console.log(snapObj.key);
        console.log(snapObj.val());
        const fireObject = snapObj.val();

        let tFrequency = fireObject.frequency;
        let firstTime = fireObject.trainTime;
        console.log(firstTime);
        // First Time (pushed back 1 year to make sure it comes before current time)
        let firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        console.log(firstTimeConverted);

        // Current Time
        let currentTime = moment().format("HH:mm");
        console.log("CURRENT TIME: " + currentTime);

        // Difference between the times
        let diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        let tRemainder = diffTime % tFrequency;
        console.log(tRemainder);

        // Minute Until Train
        let tMinutesTillTrain = tFrequency - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

        // Next Train
        let nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("HH:mm"));

        console.log(moment().add(1200, "minutes").format("HH:mm"));

        const tRow = $("<tr>").attr({ 'id': snapObj.key }).append(
            $("<td>").text(fireObject.trainName),
            $("<td>").text(fireObject.destination),
            $("<td>").text(fireObject.frequency),
            $("<td>").text(moment(nextTrain).format("hh:mm")),
            $("<td>").text(tMinutesTillTrain).append($("<button>").attr({ 'id': snapObj.key, class: "tRowButton" }).css({ float: "right" }).text("X"))
        );

        $("#trainSchedule > tbody").append(tRow);

    });

    $(document).on('click', ".tRowButton", function (eventObj) {
        console.log(eventObj);
        console.log($(this).attr('id'));
        //Call this method to remove data from firebase
        databaseURL.ref("/trainschedules").child($(this).attr('id')).remove();

        //Remove the element from DOM
        $("tr").remove("#" + $(this).attr('id'));

    });

    $("#trainAddButton").click(function (eventObj) {
        console.log(eventObj);
        trainAddObj.trainName = $("#trainName").val().trim();
        trainAddObj.destination = $("#destination").val().trim();
        trainAddObj.trainTime = $("#trainTime").val().trim();
        trainAddObj.frequency = $("#frequency").val().trim();
        console.log(trainAddObj);

        $("form :input").each(function (index, element) {
            console.log(index);
            console.log(element);
            console.log($(this));
            console.log($(this).attr('id'));
            console.log($(this).val().trim());
            if ($(this).val().trim() == "") {
                //Select element by ID
                $("#" + $(this).attr('id')).focus();
                alert("Enter the data for the field: " + $(this).attr('id'));
                validInputs = false;
                return validInputs;
            }
        });

        if (validInputs) {
            //call the Firebase push method to store the values in array and generate a firebase key for every row 
            databaseURL.ref("/trainschedules").push(trainAddObj);
            //Clear the text box values 
            $("#trainName").val("");
            $("#destination").val("");
            $("#trainTime").val("");
            $("#frequency").val("");
        }

    });

    console.log($(":input").length);

    console.log($("form > *").length);
    console.log($("form :input"));
    console.log($('div[class="form-group px-md-3"]'));
});

