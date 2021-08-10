let videoPlayer = document.querySelector("video");
let recordBtn=document.querySelector("#record");
let capturebtn=document.querySelector("#capture")
let body = document.querySelector("body");
let mediaRecorder;
let chunks=[];//to store video parts
let isrecording=false;
let filter="";

//now save pic nd video in gallery link to gallery html on click on gallery on ui
let gallery=document.querySelector("#gallery");
gallery.addEventListener("click",function(){
  location.assign("gallery.html")
});
//now for saving we use indexed db


//zoom in nd out
let zoomin=document.querySelector(".in");
let zoomout=document.querySelector(".out");
let currzoom=1;//min 1 max upto 3 else page ft jata hai

zoomin.addEventListener("click",function(){
  //zoom krne ke liye
  currzoom=currzoom+0.1;
  if(currzoom>3) currzoom=3;
  videoPlayer.style.transform=`scale(${currzoom})`;
});

zoomout.addEventListener("click",function(){
  currzoom=currzoom-0.1;
  if(currzoom<1) currzoom=1;
  videoPlayer.style.transform=`scale(${currzoom})`;
});


//make filter-div to apply filter on background of image and we can apply it only while capturing not in vr
let allFilters = document.querySelectorAll(".filter");

for (let i = 0; i < allFilters.length; i++) {
  allFilters[i].addEventListener("click", function (e) {
    let previousFilter = document.querySelector(".filter-div");
    //agr koi filter hai phle usko remove krdo

    if (previousFilter) previousFilter.remove();
    //color me save kralo current filter bac clr in style 
    let color = e.currentTarget.style.backgroundColor;
    filter = color;
    //div bnalo or add kralo filter div ko jo sari window pr filter lga dega 
    let div = document.createElement("div");
    div.classList.add("filter-div");
    //div ke back ko filter jo select kia hai usse bhrdo
    div.style.backgroundColor = color;
    body.append(div);
  });
}

//this is to capure image of video going on first put video in canvas
capturebtn.addEventListener("click", function () {

  

  let innerspan=capturebtn.querySelector("span")
  //while capturing it must show pop out that image is capturing
  innerspan.classList.add("capture-animation")
  setTimeout(function () {
    innerSpan.classList.remove("capture-animation");
  }, 1000);

  let canvas = document.createElement("canvas");
  canvas.width = videoPlayer.videoWidth; //1280x720
  canvas.height = videoPlayer.videoHeight;

  let tool = canvas.getContext("2d");

  //now zoom in zoom out button works add this while we take image in canvas
  //top left to center
  tool.translate(canvas.width/2,canvas.height/2);
  //zoom basically strech krao canvas ko tb draw kro image tb capture kro
  tool.scale(currzoom,currzoom);
  //wapis usko center se left me le jao
  tool.translate(-canvas.width/2,-canvas.height/2);
  //yha tk image jo draw hoga zoom in zoom out ke sath hogi




  //same size as video player canvas created and same size video is played in canvas
  tool.drawImage(videoPlayer, 0, 0);
  //ab yha pr vo filter add krana hai image capture krte hue
  if(filter!=""){
    tool.fillStyle=filter;//filter me selected color hai globally store kra lia
    //ab ek rec bn jae canvas ki height width ka jispr vo filter lg jae image cap krte hue
    tool.fillRect(0,0,canvas.width,canvas.height)

  }

  let url = canvas.toDataURL();
  //we directly save this in dbms by calling functn here no need to download
  canvas.remove();
  saveMedia(url);
  

  // let a = document.createElement("a");
  // a.href = url;
  // a.download = "image.png";
  // a.click();
  
});

//if we click thn will see no record start if started thn stop
recordBtn.addEventListener("click",function(){
  let innerspan=recordBtn.querySelector("span")
  
       if(isrecording){//true
       //stop krna hai rec ko
       mediaRecorder.stop()//ye chlega to niche  rec save vala kaam chlega
       isrecording=false;
       innerspan.classList.remove("record-animation")
       }
       else{
           //rec suru krni hai
           mediaRecorder.start()
           //ab yha se zoom in out htao video me ye kaam nhi krta
           currzoom=1;
           videoPlayer.style.transform=`scale(${currzoom})`;
           isrecording=true;
           innerspan.classList.add("record-animation")
       }  

   });
let promiseToUseCamera = navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

promiseToUseCamera
  .then(function (mediaStream) {

    videoPlayer.srcObject = mediaStream;

    mediaRecorder= new MediaRecorder(mediaStream);//yha media stream me audio video aa gyi hai jo record krna hai

   //jaise data mile chunks me add kralo sara fir blob me jodlo
    mediaRecorder.addEventListener("dataavailable",function(e){
        chunks.push(e.data);

    });

    mediaRecorder.addEventListener("stop",function(e){//jb stop kre  to blob me sare chunks daal lo sari ek sath video mil jaegi in blob
       let blob=new Blob(chunks,{type:"video/mp4"});
       chunks=[];
       //no need of below code no download jst save in dbms by calling function of indexdb
       saveMedia(blob);

      //  let link=URL.createObjectURL(blob);//ab iss blob ka link bnalo jisse link se hum video download krle
      //  let a=document.createElement("a")//anchor tag bna lia jisme link nikal lenge or download kr lenge or click krte hi record pr khud download ho jae
      //   a.href=link;
      //   a.download="video.mp4"
      //   a.click();
    });
  })
  .catch(function () {
    console.log("user has denied the access of camera");
  });
