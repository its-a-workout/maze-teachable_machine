    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

    // the link to your model provided by Teachable Machine export panel


    const URL = "./my_model_pose/";
    const samePoseCount = 5; //같은 포즈가 몇번이상 나오면 포즈가 바뀐것으로 간주할지 결정하는 변수
    const posePredictPecent = 0.7; //포즈 확률이 몇퍼센트 이상이면 해당 포즈로 간주할지 결정하는 변수

    let model, webcam, ctx, labelContainer, maxPredictions;
    let poseList=[]; //posePredictPecent 이상의 확률을 가진 포즈만 poseList에 저장
    let state_pose = 'None';
    let count=0;
    let before_pose = 'None';
    let direction = 'None';
    let if_first_stand = false;
    let my_pose='None';
    let tutorial_state = ['stand','squat','jump with arms','left side exercise','right side exercise','Done'];
    let tutorial_gif = ['1.gif','2.gif','3.gif','4.gif','5.gif'];
    let tutorial_state_num = 0;
    let myHtml = document.getElementsByTagName("title")[0].innerHTML;
    let myGif = document.getElementsByClassName("myGif")[0];



    async function init() {
        if (myHtml=='tutorial') tutorial();

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
        window.requestAnimationFrame(loop); //1초에 60번씩 실행

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

    // delay 함수 (일단은 사용하지 않음)
    function delay(milliseconds){
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    //포즈 모델의 결과값들을 통해 같은값이 samePoseCount번이상 나오면 state_pose에 저장
    async function pose_state(){

        //console.log("happy");
        //console.log('count : '+count);
        before_pose=poseList[poseList.length-1];

        if(myHtml=='tutorial'){
            if (state_pose==tutorial_state[tutorial_state_num]){
                tutorial_state_num++;
                tutorial();
            }

        }

        if(count==samePoseCount){
            state_pose=poseList[poseList.length-1];
            console.log("state_pose : "+state_pose);
            count=0;
            poseList=[];
            poseChanged();

        
        }
        if (poseList[poseList.length-1] == before_pose){
            count++;
        }
        else{
            count=0;
        }
    }
    //스탠드 -> 포즈 -> 스탠드가 되면 포즈가 바뀐것으로 간주
    async function poseChanged(){

        if (state_pose=='stand' && !if_first_stand){
            if_first_stand=true;
        }
        else if(state_pose!='stand' && if_first_stand){
            my_pose=state_pose;
        }
   
        else if(state_pose=='stand'){

            moveCharacterByPose();
            if_first_stand=false;
            my_pose='None';
        }
        
        
        
    } 
    //포즈에 따라 캐릭터 조작 명령 함수 실행시키기
    async function moveCharacterByPose(){
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
    async function tutorial(){
        console.log("tutorial_state_num : "+tutorial_state_num);
        //let whatTodo = document.getElementById("whatTodo");
        whatTodo.innerHTML = "What to do:"+tutorial_state[tutorial_state_num];
        //myGif="2.gif";
        console.log(myGif);
        myGif.src=tutorial_gif[tutorial_state_num];
        console.log(myGif);
    
        if(tutorial_state[tutorial_state_num]=='Done'){
                var link = 'main.html';
                location.replace(link);
            }

    }


    async function predict() {
        // Prediction #1: run input through posenet
        // estimatePose can take in an image, video or canvas html element
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        // Prediction 2: run input through teachable machine classification model
        const prediction = await model.predict(posenetOutput);
        //await delay(100);


        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                //posePredictPecent 이상의 확률을 가진 포즈만 poseList에 저장
                if (prediction[i].probability.toFixed(2) > posePredictPecent) {
                    poseList.push(prediction[i].className);
                    pose_state();
                    //if (state_pose=="stand")
                }
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
        //console.log(poseList);



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


