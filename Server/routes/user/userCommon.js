var async=require("asyncawait/async")
var await=require("asyncawait/await")
var user=require("../../model/userModel")
var group=require("../../model/groupModel")
var apply=require("../../model/applyModel")
var project=require("../../model/projectModel")
var team=require("../../model/teamModel")
var teamGroup=require("../../model/teamGroupModel")
var message=require("../../model/messageModel")
var util=require("../../util/util")
var request=require("request");
var requestAsync=require("../../third/requestAsync");
var fs=require("fs")
var path=require("path")
var con=require("../../../config.json");
var uuid=require("uuid")
function UserCommon() {
    this.downloadImg=async ((url)=>{
        return new Promise(function (resolve) {
            var imgPath=path.join(con.filePath,"img",uuid()+".png");
            var pipe=request(url).pipe(fs.createWriteStream(imgPath))
            pipe.on("finish",function () {
                var filePath=imgPath;
                var i=filePath.lastIndexOf(path.sep);
                i=filePath.lastIndexOf(path.sep,i-1);
                filePath=filePath.substring(i).replace(/\\/g,"/");
                resolve(filePath);
            })
        })
    })
    this.setQQImg=async ((userId,url)=>{
        let imgPath=await (this.downloadImg(url));
        let obj=await (user.findOneAndUpdateAsync({
            _id:userId
        },{
            photo:imgPath
        }));
        if(obj.photo)
        {
            util.delImg(obj.photo);
        }
    })
    this.existUserInTeam=async ((teamId,userId)=> {
        let arrUser=await (teamGroup.findAsync({
            team:teamId
        }))
        let bFind=false;
        for(let obj of arrUser) {
            for (let obj1 of obj.users) {
                if(obj1.user.toString()==userId.toString())
                {
                    bFind=true;
                    break;
                }
            }
            if(bFind)
            {
                break;
            }
        }
        if(bFind)
        {
            return true;
        }
        else
        {
            return false;
        }
    })
    this.updateUser=async ((name,password,id,qqId)=>{
        let obj;
        if(id)
        {
            obj= await (user.findOneAsync({
                _id:id
            },"-password -question -answer"));
        }
        else if(qqId)
        {
            obj= await (user.findOneAsync({
                qqId:qqId
            },"-password -question -answer"));
        }
        else
        {
            obj= await (user.findOneAsync({
                name:name
            },"-password -question -answer"));
        }
        if(obj)
        {
            obj.lastLoginDate=Date.now();
            obj.loginCount++;
            await (obj.saveAsync());
        }
        return obj;
    })
    this.loginUxin=async ((name, password)=>{
      const hostname = "http://branch_v2.service.ceshi.xin.com",
            path = "/staff/login";
      return requestAsync({
          url: hostname + path,
          method: "POST",
          form: {
            username: name,
            pwd: password
          }
      }).then((result) => {
        let body;
        if(result.statusCode!="200"){
          const errorMsg = "登录域账号请求失败，请稍后重试";
          console.log(errorMsg);
          body = {
            code: result.statusCode,
            msg: errorMsg
          }
        }else{
          body = JSON.parse(result.body);
        }
        return body;
      });
    })
}

module.exports=UserCommon;
