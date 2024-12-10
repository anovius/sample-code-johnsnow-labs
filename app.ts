import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import config from '@config/index';
import loggerMiddleware from '@middlewares/log/logger';
import router from '@routes/router';
import '@utils/passport';
import { initSocketIO } from '@utils/socket';
import path from 'path';
import { getPostById } from '@helper/post';
var useragent = require( 'express-useragent' );

const app = express();

// Set view engine and views directory
app.set( 'view engine', 'ejs' );
app.set( 'views', path.join( process.cwd(), 'src', 'views' ) );

const corsOptions = {
    origin: ( origin: string | undefined, callback: ( err: Error | null, allow?: boolean ) => void ) => {
        if ( !origin || config.allowedOrigins.includes( origin ) ) {
            callback( null, true );
        } else {
            callback( new Error( 'Not allowed by CORS' ) );
        }
    },
    optionsSuccessStatus: 200,
};

app.use( helmet() );
app.use( cors( corsOptions ) );
app.use( compression() );
app.use( useragent.express() );
app.use( morgan( 'dev' ) );
app.use( express.json() );



app.use(
    helmet.contentSecurityPolicy( {
        useDefaults: true,
        directives: {
            'default-src': [ "'self'" ], // Default policy for loading HTML content
            'media-src': [ "'self'", 'https://blockchat-uploads-bucket.s3.amazonaws.com' ], // Allow media from self and your S3 bucket
            'script-src': [ "'self'" ], // Scripts can only be loaded from the same origin
            'style-src': [ "'self'", 'https://use.fontawesome.com' ], // Allow styles from self and FontAwesome
            'img-src': [ "'self'", 'https:', 'data:', 'https://blockchat-uploads-bucket.s3.amazonaws.com' ] // Combined img-src directives
            // Add other directives as needed
        },
        reportOnly: false, // Set to true if you want browsers to report violations but not block them
    } )
);



// API routes
app.use( '/api/v1', router );

// Catch-all 404 handler
app.use( ( req, res ) => {
    res.status( 404 ).json( {
        api: req.originalUrl,
        message: 'The API you requested was not found',
        status: 404,
    } );
} );

// Start the server
const server = app.listen( config.port, () => {
    console.log( `🚀 Server is up and running!` );
    console.log( `🌐 Listening on PORT:${config.port}` );
    console.log( `📅 Started at: ${new Date().toLocaleString()}` );
    console.log( `🎉 Ready to handle requests!` );
} );

// Initialize Socket.IO
initSocketIO( server );
