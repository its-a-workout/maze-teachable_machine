    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

    // the link to your model provided by Teachable Machine export panel
    const URL = "./my_model_pose/";
    let model, webcam, ctx, labelContainer, maxPredictions;
    let result=[];
    let state_pose = 'None';
    let count=0;
    let before_pose = 'None';
    let direction = 'None';
    let if_first_stand = false;
    let if_second_stand = false;
    let my_pose='None';



    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // Note: the pose library adds a tmPose object to your window (window.tmPose)
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const size = 300;
        const flip = true; // whether to flip the webcam
        webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append/get elements to the DOM
        const canvas = document.getElementById("canvas");
        canvas.width = size; canvas.height = size;
        ctx = canvas.getContext("2d");
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop(timestamp) {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }
    function delay(milliseconds){
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    //포즈 모델의 결과값들을 통해 같은값이 5번이상 나오면 state_pose에 저장
    async function pose_state(){
        

        //console.log("happy");
        //console.log('count : '+count);
        before_pose=result[result.length-1];


        if(count==5){
            state_pose=result[result.length-1];
            console.log("state_pose : "+state_pose);
            count=0;
            result=[];
            get_direction();
            //var link = 'maze.html';
            //location.replace(link);
        
        }
        if (result[result.length-1] == before_pose){
            count++;
        }
        else{
            count=0;
        }
    }

    async function get_direction(){

        if (state_pose=='stand' && !if_first_stand){
            if_first_stand=true;
        }
        else if(state_pose!='stand' && if_first_stand){
            my_pose=state_pose;
        }
        else if(state_pose=='stand'){
            change_direction();
            if_first_stand=false;
            my_pose='None';
        }
        
        
        
    } 

    async function change_direction(){
        if(my_pose=='squat'){
            MazeGame.moveCharacter("down");
            console.log("down");
        }
        else if(my_pose=='right side exercise'){
            MazeGame.moveCharacter("right");
            console.log("right");
        }
        else if(my_pose=='left side exercise'){
            MazeGame.moveCharacter("left");
            console.log("left");
        }
        else if(my_pose=='jump with arms'){
            MazeGame.moveCharacter("up");
            console.log("up");
        }
    }

    async function predict() {
        // Prediction #1: run input through posenet
        // estimatePose can take in an image, video or canvas html element
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        // Prediction 2: run input through teachable machine classification model
        const prediction = await model.predict(posenetOutput);
        await delay(100);


        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                if (prediction[i].probability.toFixed(2) > 0.7) {
                    result.push(prediction[i].className);
                    pose_state();
                    //if (state_pose=="stand")
                }
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
        //console.log(result);



        // finally draw the poses
        drawPose(pose);
    }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            // draw the keypoints and skeleton
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }
    init();


