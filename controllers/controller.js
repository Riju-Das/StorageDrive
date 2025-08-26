const passport = require("../config/passport")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const db = require("../db/queries")
const supabase = require("../config/supabase")


async function getHomePage(req, res) {
    const user = req.user
    try {
        if (!user) {
            return res.render("index", {
                user: user,
            })
        }
        const folders = await db.getFolderByUserId(user.id)
        const files = await db.getLooseFileByUserId(user.id)
        res.render("index", {
            user: user,
            folders: folders,
            files: files
        })
    }
    catch (err) {
        console.log(err)
    }

}

async function getLoginPage(req, res) {
    res.render("login")
}

async function postLoginPage(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render("login", {
            errors: errors.array().map(err => err.msg)
        })
    }
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
    })(req, res, next)
}

async function postLogout(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        res.redirect("/")
    })
}

async function getSignUpPage(req, res) {
    res.render("signup")
}

async function postSignUpPage(req, res) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.render("signup", {
            errors: errors.array().map(err => err.msg)
        })
    }
    try {
        const { username, fullname, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.addUser(username, fullname, email, hashedPassword)
        return res.redirect("/login");
    }
    catch (err) {
        console.log(err)

        if (err.code === 'P2002') {
            return res.render("signup", {
                errors: ["Username already exists"]
            });
        }

        return res.render("signup", {
            errors: ["Something went wrong. Please try again."]
        });
    }
}

async function getUploadLooseFile(req, res) {
    const user = req.user
    if (!user) {
        return res.redirect("/")
    }
    res.render("upload")
}

async function postUploadLooseFile(req, res) {
    if (!req.file) {
        return res.send("File does not exists")
    }
    try {
        const file = req.file
        const size = req.file.size
        const userId = req.user.id
        const filePath = `${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage
            .from("myStorageDrive")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype
            })

        if (error) {
            console.error("Supabase upload error:", error.message);
            return res.status(500).send("Failed to upload file to storage");
        }

        await db.uploadLooseFile(filePath, size, userId)
        res.redirect("/")
    }
    catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong while saving the file");
    }
}

async function getUploadFolderFile(req, res) {
    const user = req.user
    if (!user) {
        return res.redirect("/")
    }
    const { folderId } = req.params
    res.render("uploadfolder", {
        folderId: folderId
    })
}

async function postUploadFolderFile(req, res) {
    if (!req.file) {
        return res.send("File does not exists")
    }
    try {
        const { folderId } = req.params
        const file = req.file
        const size = req.file.size
        const userId = req.user.id
        const filePath = `${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage
            .from("myStorageDrive")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype
            })

        if (error) {
            console.error("Supabase upload error:", error.message);
            return res.status(500).send("Failed to upload file to storage");
        }

        await db.uploadFolderFile(filePath, size, userId, folderId)
        res.redirect(`/${folderId}`)
    }
    catch (err) {
        console.log(err)
        res.status(500).send("Something went wrong while saving the file");
    }
}

async function getCreateFolder(req, res) {
    const user = req.user;
    if (!user) {
        return res.redirect("/")
    }
    res.render("createfolder")

}

async function postCreateFolder(req, res) {
    const { folderName } = req.body
    const userId = req.user.id
    try {
        await db.createFolder(folderName, userId)
        res.redirect("/")
    }
    catch (err) {
        console.log(err)
    }
}

async function getFolder(req, res) {
    const { folderId } = req.params
    const user = req.user
    if (!user) {
        return res.redirect("/")
    }
    try {
        const folder = await db.getFolderByFolderId(folderId)
        if (!folder) {
            return res.status(404).send("Folder not found");
        }
        const files = await db.getFileByFolderId(folderId)

        res.render("folder", {
            user: user,
            folder: folder,
            files: files
        })
    }
    catch (err) {
        console.log(err)
    }
}

async function downloadFile(req, res) {
    const user = req.user
    if (!user) {
        return res.redirect("/")
    }
    const { fileId } = req.params
    try {
        const file = await db.fetchFileByFileId(fileId)
        if (!file) return res.status(404).send("File not found");
        const { data, error } = supabase.storage
            .from("myStorageDrive")
            .getPublicUrl(file.url);
        if (error) {
            console.error("Error getting public URL:", error.message);
            return res.status(500).send("Error getting file URL");
        }
        return res.redirect(data.publicUrl);
    }
    catch (err) {
        console.log(err)
    }
}
async function deleteFile(req, res) {
    const user = req.user
    if (!user) {
        return res.redirect("/")
    }
    const { fileId } = req.params
    try {
        const file = await db.fetchFileByFileId(fileId)
        if (!file) return res.status(404).send("File not found");


        const { error } = await supabase.storage
            .from("myStorageDrive")
            .remove([file.url]);

        if (error) console.log(error);

        await db.deleteFile(fileId)
        res.redirect("/")
    }
    catch (err) {
        console.log(err)
    }
}

async function deleteFolder(req, res) {
    const user = req.user
    if (!user) {
        return res.redirect("/")
    }
    const { folderId } = req.params
    try {
        const files = await db.getFileByFolderId(folderId)
        const folder = await db.getFolderByFolderId(folderId)

        if (!folder) {
            return res.status(404).send("Folder not found");
        }
        const filePaths = files
            .filter(f => f && f.url)
            .map(f => f.url);
        if(filePaths.length>0){
            const { error } = await supabase.storage
                .from("myStorageDrive")
                .remove(filePaths);

            if (error) {
                console.error("Supabase deletion error:", error.message);
                return res.status(500).send("Error deleting files from storage");
            }
        }
        for (const file of files) {
            if(file) await db.deleteFile(file.id)
        }
        await db.deleteFolder(folderId)
        res.redirect("/")
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    getHomePage,
    getLoginPage,
    postLoginPage,
    postLogout,
    getSignUpPage,
    postSignUpPage,
    getUploadLooseFile,
    postUploadLooseFile,
    getUploadFolderFile,
    postUploadFolderFile,
    getCreateFolder,
    postCreateFolder,
    getFolder,
    downloadFile,
    deleteFile,
    deleteFolder

}