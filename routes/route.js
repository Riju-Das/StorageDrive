const controller = require("../controllers/controller")
const express = require("express")
const { LoginValidation, Signupvalidation } = require("../validation")
const upload = require("../config/upload")

const route = express.Router()

route.get("/", controller.getHomePage)
route.get("/login", controller.getLoginPage)

route.post("/login", LoginValidation,  controller.postLoginPage)
route.post("/logout", controller.postLogout)

route.get("/sign-up", controller.getSignUpPage)
route.post("/sign-up", Signupvalidation, controller.postSignUpPage)

route.get("/upload" , controller.getUploadLooseFile)
route.post("/upload" , upload.single("file") , controller.postUploadLooseFile )

route.get("/:folderId/upload", controller.getUploadFolderFile)
route.post("/:folderId/upload",upload.single("file") ,controller.postUploadFolderFile)

route.get("/create-folder", controller.getCreateFolder)
route.post("/create-folder", controller.postCreateFolder)

route.get("/:folderId" , controller.getFolder)

route.get("/download/:fileId", controller.downloadFile)

route.post('/delete/:fileId', controller.deleteFile);

route.post("/:folderId/delete" , controller.deleteFolder)

module.exports = route