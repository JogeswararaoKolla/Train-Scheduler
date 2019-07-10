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
let trainUpdateObj = {};
let snapReadonceObjKeys=[];
let snapReadonceObjValues=[];
let databaseURL = firebase.database();
let validInputsAdd = true;
let validInputsUpdate = true;

$(document).ready(function (eventReadyObj) {

    databaseURL.ref("/trainschedules").on('child_changed', function (snapChangedObj) {
        console.log(snapChangedObj.key);
        console.log(snapChangedObj.val());
    });

    databaseURL.ref("/trainschedules").on('child_removed', function (snapRemovedObj) {
        console.log("Inside the Child Removed Function");
        console.log(snapRemovedObj.key);
        console.log(snapRemovedObj.val());
        //Remove the element from DOM
        $("tr").remove("#" + snapRemovedObj.key);
    });

    // databaseURL.ref("trainschedules").once('value', function (snapReadonceObj) {
    //     snapReadonceObjKeys = Object.keys(snapReadonceObj.val());
    //     snapReadonceObjValues = Object.values(snapReadonceObj.val());
    //     console.log(snapReadonceObjKeys);
    //     console.log(snapReadonceObjValues);
    // });

    // Method triggers once at page load and runs every time a new child is added 
    databaseURL.ref("/trainschedules").on('child_added', function(snapChildAddedObj) {
        console.log(snapChildAddedObj.key);
        console.log(snapChildAddedObj.val());

        snapReadonceObjKeys.push(snapChildAddedObj.key);
        snapReadonceObjValues.push(snapChildAddedObj.val());
        console.log(snapReadonceObjKeys);
        console.log(snapReadonceObjValues);

        const ChildAddedObj = snapChildAddedObj.val();
        let tFrequency = ChildAddedObj.frequency;
        let firstTime = ChildAddedObj.trainTime;

        // First Time (pushed back 1 year to make sure it comes before current time)
        let firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");

        // Current Time
        let currentTime = moment().format("YYYY dddd,MMMM,DD HH:mm A");
        console.log("DATE & TIME: " + currentTime);

        // Difference between the times
        let diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        // Time apart (remainder)
        let tRemainder = diffTime % tFrequency;

        // Minute Until Train
        let tMinutesTillTrain = tFrequency - tRemainder;

        // Next Train
        let nextTrain = moment().add(tMinutesTillTrain, "minutes").format("HH:mm A");

        const tRow = $("<tr>").attr({ 'id': snapChildAddedObj.key }).append(
            $("<td>").text(ChildAddedObj.trainName),
            $("<td>").text(ChildAddedObj.destination),
            $("<td>").text(ChildAddedObj.frequency),
            $("<td>").text(nextTrain),
            $("<td>").text(tMinutesTillTrain).append($("<button>").attr({ 'id': snapChildAddedObj.key, class: "tRowButton" }).css({ float: "right" }).text("X"))
        );
        
        $("#trainSchedule > tbody").append(tRow);

    });

    $(document).on('click', ".tRowButton", function (eventDeleteObj) {
        eventDeleteObj.preventDefault();
        console.log($(this).attr('id'));
        //Call this method to remove data from firebase
        databaseURL.ref("/trainschedules").child($(this).attr('id')).remove();
    });

    $("#trainAddButton").click(function (eventAddObj) {
        eventAddObj.preventDefault();
        trainAddObj = {};
        trainAddObj.trainName = $("#trainName").val().trim();
        trainAddObj.destination = $("#destination").val().trim();
        trainAddObj.trainTime = $("#trainTime").val().trim();
        trainAddObj.frequency = $("#frequency").val().trim();
        console.log(trainAddObj);

        $("form :input").each(function (index, element) {
            //  console.log("index: " + index,element,"attribute:" + $(this).attr('id'),"Value: " + $(this).val().trim());
            if ($(this).val().trim() == "") {
                //Select element by ID
                $("#" + $(this).attr('id')).focus();
                alert("Enter the data for the field: " + $(this).attr('id'));
                validInputsAdd = false;
                return validInputsAdd;
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

    $("#trainUpdateButton").click(function (eventUpdateObj) {
        eventUpdateObj.preventDefault();
        let foundChild = false;
        let ChildTrainNameKey = "";

        trainUpdateObj = {};
        trainUpdateObj.trainName = $("#trainName").val().trim();

        // if (trainUpdateObj.trainName == "") {
        //     validInputsUpdate = false;
        //     alert("Enter the data for the field: " + $("#trainName").attr('id'));
        //     $("#trainName").focus();
        //     console.log(validInputsUpdate);
        // }
        // else if (trainUpdateObj.trainName != "") {
        //     validInputsUpdate = true;
        // }

        $("form :input").each(function (index, element) {
            console.log("index: " + index, element, "attribute:" + $(this).attr('id'), "Value: " + $(this).val().trim());
            if ($(this).val().trim() != "") {
                //Select element by ID
                const element = $(this).attr('id');
                console.log(element);
                trainUpdateObj[element] = $(this).val().trim();
                console.log(trainUpdateObj);
            }
        });

        if (validInputsUpdate) {
            databaseURL.ref("/trainschedules").once('value')
                .then(function (snapshotObj) {
                    snapshotObj.forEach(function (childSnapObj) {
                        console.log(childSnapObj.val());
                        console.log(childSnapObj.key);
                        let trainUpdateObjlocal = {};
                        trainUpdateObjlocal = childSnapObj.val();
                        if (trainUpdateObjlocal.trainName == $("#trainName").val().trim()) {
                            foundChild = true;
                            ChildTrainNameKey = childSnapObj.key;
                            console.log(foundChild, ChildTrainNameKey);
                        }
                    });

                    if (foundChild) {
                        trainUpdateObjlocal = {};
                        databaseURL.ref("/trainschedules").child(ChildTrainNameKey).once("value")
                            .then(function (snapChildObj) {
                                console.log(snapChildObj.key);
                                console.log(snapChildObj.val());
                            });

                        if (Object.keys(trainUpdateObj).length == 1) {
                            alert("Enter the values to the input fields");
                        }
                        else {

                            console.log(trainUpdateObj);
                            let result = databaseURL.ref("/trainschedules").child(ChildTrainNameKey).update(trainUpdateObj);

                            console.log(result);
                            //Clear the text box values 
                            $("#trainName").val("");
                            $("#destination").val("");
                            $("#trainTime").val("");
                            $("#frequency").val("");
                            window.location.reload();
                        }

                    }
                    // else {
                    //     alert("Enter valid Train Name to Update!!");
                    // }

                })
                .catch(function (errorUpdateObj) {
                    console.log(errorUpdateObj);
                });
        }

    });

});

