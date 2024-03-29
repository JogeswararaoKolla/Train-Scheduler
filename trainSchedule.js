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
let snapReadonceObjKeys = [];
let snapReadonceObjValues = [];
let databaseURL = firebase.database();
let validInputsAdd = true;
let validInputsUpdate = true;

$(document).ready(function (eventReadyObj) {

    databaseURL.ref("/trainschedules").on('child_changed', function (snapChangedObj) {
        let snapChangedValueObj = {};
        let snapChangedKeyObj={};
        snapChangedValueObj = snapChangedObj.val();
        snapChangedKeyObj=snapChangedObj.key;

        const snapChangedObjIndex = snapReadonceObjKeys.indexOf(snapChangedKeyObj);
        console.log("Inside the child_changed function Start");
        console.log(snapChangedKeyObj);
        console.log(snapChangedValueObj);
        console.log(trainUpdateObj);
        //Remove 1 element from index and insert new element..it is like element replace
        snapReadonceObjValues.splice(snapChangedObjIndex,1,snapChangedValueObj);
        
        // First Time (pushed back 1 year to make sure it comes before current time)
        let firstTimeConverted = moment(snapChangedValueObj.trainTime, "HH:mm").subtract(1, "years");
        // Current Time
        let diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // Time apart (remainder)
        let tRemainder = diffTime % snapChangedValueObj.frequency;
        // Minute Until Train
        let tMinutesTillTrain = snapChangedValueObj.frequency - tRemainder;
        // Next Train
        let nextTrain = moment().add(tMinutesTillTrain, "minutes").format("HH:mm A");

        const tRow = $("<tr>").attr({ 'id': snapChangedKeyObj }).append(
            $("<td>").text(snapChangedValueObj.trainName),
            $("<td>").text(snapChangedValueObj.destination),
            $("<td>").text(snapChangedValueObj.frequency),
            $("<td>").text(nextTrain),
            $("<td>").text(tMinutesTillTrain).append($("<button>").attr({ 'id': snapChangedKeyObj, class: "tRowButton" }).css({ float: "right" }).text("X"))
        );
        // .html() Description: Get the HTML contents of the first element in the set of matched elements.
        // .html( htmlString) Description: Set the HTML contents of each element in the set of matched elements
        const tRow2 = $("#" + snapChangedKeyObj);
        console.log($(tRow).html());
        console.log(tRow2);
        console.log(tRow2.html());
        tRow2.html($(tRow).html());
        console.log(tRow);
        console.log("Inside the child_changed function End");
    });

    databaseURL.ref("/trainschedules").on('child_removed', function (snapRemovedObj) {
        const snapRemovedObjIndex = snapReadonceObjKeys.indexOf(snapRemovedObj.key);
        //The splice() method changes the contents of an array by removing or replacing existing elements and/or adding new elements
        //Remove 1 element from an index 
        snapReadonceObjKeys.splice(snapRemovedObjIndex, 1);
        snapReadonceObjValues.splice(snapRemovedObjIndex, 1);
        console.log(snapReadonceObjKeys, snapReadonceObjValues);
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
    databaseURL.ref("/trainschedules").on('child_added', function (snapChildAddedObj) {

        snapReadonceObjKeys.push(snapChildAddedObj.key);
        snapReadonceObjValues.push(snapChildAddedObj.val());

        const ChildAddedObj = snapChildAddedObj.val();
        let tFrequency = ChildAddedObj.frequency;
        let firstTime = ChildAddedObj.trainTime;

        // First Time (pushed back 1 year to make sure it comes before current time)
        let firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        // Current Time
        let currentTime = moment().format("YYYY dddd,MMMM,DD HH:mm A");
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
            if ($(this).val().trim() == "") {
                //Select element by ID
                $("#" + $(this).attr('id')).focus();
                alert("Enter the data for the field: " + $(this).attr('id'));
                validInputsAdd = false;
                return validInputsAdd;
            }
        });

        if (validInputsAdd) {
            //call the Firebase push method to store the values in array and generate a firebase key for every row 
            databaseURL.ref("/trainschedules").push(trainAddObj);
            console.log(snapReadonceObjKeys, snapReadonceObjValues);
            //Clear the text box values 
            $("#trainName").val("");
            $("#destination").val("");
            $("#trainTime").val("");
            $("#frequency").val("");
        }
    });

    $("#trainUpdateButton").click(function (eventUpdateObj) {
        eventUpdateObj.preventDefault();
        console.log("Inside the trainUpdateButton Start");
        let foundChild = false;
        let ChildTrainNameKey = "";

        trainUpdateObj = {};
        trainUpdateObj.trainName = $("#trainName").val().trim();

        if (trainUpdateObj.trainName == "") {
            validInputsUpdate = false;
            alert("Enter the data for the field: " + $("#trainName").attr('id'));
            $("#trainName").focus();
        }
        else if (trainUpdateObj.trainName != "") {
            validInputsUpdate = true;
        }

        $("form :input").each(function (index, element) {
            // console.log("index: " + index, element, "attribute:" + $(this).attr('id'), "Value: " + $(this).val().trim());
            if ($(this).val().trim() != "") {
                //Select element by ID
                const element = $(this).attr('id');
                trainUpdateObj[element] = $(this).val().trim();

            }
        });

        //logging the update object
        console.log(trainUpdateObj);

        if (validInputsUpdate) {
            databaseURL.ref("/trainschedules").once('value')
                .then(function (snapReadonceObj) {
                    snapReadonceObj.forEach(function (childSnapObj) {
                        let trainUpdateObjlocal = {};
                        trainUpdateObjlocal = childSnapObj.val();
                        if (trainUpdateObjlocal.trainName == $("#trainName").val().trim()) {
                            foundChild = true;
                            ChildTrainNameKey = childSnapObj.key;
                            console.log(foundChild, ChildTrainNameKey);
                        }
                    });

                    if (foundChild) {
                        if (Object.keys(trainUpdateObj).length == 1) {
                            alert("Update atleast one input element fields");
                        }
                        else {
                            //Firebase method to update the child object 
                            databaseURL.ref("/trainschedules").child(ChildTrainNameKey).update(trainUpdateObj);
                            //Clear the text box values 
                            $("#trainName").val("");
                            $("#destination").val("");
                            $("#trainTime").val("");
                            $("#frequency").val("");
                        }
                    }
                    else {
                        alert("Enter valid Train Name to Update!!");
                    }
                });
        }
        console.log("Inside the trainUpdateButton End");
    });

});

