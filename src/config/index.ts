import dotenv from 'dotenv';
dotenv.config();

const config = {
    secret: process.env.SECRET,
    port: process.env.PORT || 8000,
    dbURL: process.env.DB_URL || 'mysql://root:password@localhost:3306/db',
    defaultSpaceId: process.env.DEFAULT_SPACE_ID,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME,
    s3Region: process.env.S3_REGION,
    s3URL: process.env.S3_URL,
    defaultProfilePhoto: "https://blockchat-uploads-bucket.s3.amazonaws.com/defaults/avatar/avatar-one.png",
    defaultCoverPhoto: "https://blockchat-uploads-bucket.s3.amazonaws.com/defaults/bcd-cover.png",
    allowedOrigins: [
        'http://localhost:3000',
        'https://bcd-dev.site'
    ]
}

export default config;