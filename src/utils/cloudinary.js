import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async (localFielPath) => {
    try {
        if(!localFielPath) return null
        // uploading file in cloudinary
        const response = await cloudinary.uploader.upload(localFielPath,{
            resource_type : "auto"
        })
        console.log("File is successfuly uploaded in cloudinary",response)
        // file uploaded in coudinary
        fs.unlinkSync(localFielPath)
        return response
    } catch (error) {
        fs.unlinkSync(localFielPath) //remove the locally saved file 
    }
}

const deleteFromCloudinary = async (localFielPath)=>{
    try {
        if(!localFielPath){
            null
        }
        const response = await cloudinary.uploader.destroy(localFielPath,{
            resource_type : "auto"
        })
        console.log("File deleted from cloudinary !")
        fs.unlinkSync(localFielPath)
    } catch (error) {
        console.log("Error while deleting the file from cloudinary !",error)
        fs.unlinkSync(localFielPath)
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}
