const { PrismaClient } = require('../generated/prisma')

const prisma = new PrismaClient()

async function findUsername(username) {
  return await prisma.users.findUnique({
    where: {
      username: username
    }
  })
}
async function fetchUser(id) {
  return await prisma.users.findUnique({
    where: {
      id: id
    }
  })
}

async function addUser(username, fullname, email, password) {
  await prisma.users.create({
    data: {
      username: username,
      fullname: fullname,
      email: email,
      password: password
    }
  })
}

async function getFolderByUserId(id) {
  return await prisma.folder.findMany({
    where: {
      userId: id
    }
  })
}

async function getLooseFileByUserId(id) {
  return await prisma.file.findMany({
    where: {
      userId: id,
      folderId: null
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

async function getFileByFolderId(folderId) {
  return await prisma.file.findMany({
    where: {
      folderId: folderId
    }
  })
}

async function getFolderByFolderId(folderId) {
  return await prisma.folder.findUnique({
    where: {
      id: folderId
    }
  })
}

async function uploadLooseFile(filename, size, userId) {
  await prisma.file.create({
    data: {
      url: filename,
      size: size,
      userId: userId
    }
  })
}
async function uploadFolderFile(filename, size, userId, folderId) {
  await prisma.file.create({
    data: {
      url: filename,
      size: size,
      userId: userId,
      folderId: folderId
    }
  })
}

async function createFolder(foldername, userId) {
  await prisma.folder.create({
    data: {
      userId: userId,
      name: foldername
    }
  })
}

async function fetchFileByFileId(id) {
  return await prisma.file.findUnique({
    where: {
      id: id
    }
  })
}

async function deleteFile(id) {
  await prisma.file.delete({
    where: {
      id: id
    }
  })
}

async function deleteFolder(id) {
  await prisma.folder.delete({
    where:{
      id:id
    }
  })
}

module.exports = {
  findUsername,
  fetchUser,
  addUser,
  getFolderByUserId,
  getLooseFileByUserId,
  uploadLooseFile,
  uploadFolderFile,
  createFolder,
  getFileByFolderId,
  getFolderByFolderId,
  fetchFileByFileId,
  deleteFile,
  deleteFolder
}