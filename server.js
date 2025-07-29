require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Database Connection
const Connect = require("./database/connection.js");

// importing routes
const UserRoutes = require("./Routes/UserRoutes/Routes.js");
const LoginRoutes = require("./Routes/LoginRoutes/Routes.js");
const CdnRoutes = require("./Routes/CdnRoutes/Routes.js");
const StreamingLocationRoutes = require("./Routes/StreamingLocationRoutes/Routes.js");
const LiveUserRoutes = require("./Routes/LiveUserRoutes/Routes.js");
const GlobalGeoFencingRoutes = require("./Routes/GlobalGeoFencingRoutes/Routes.js");

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.set('socketio', io);

app.post("/emit/geofence", express.json(), (req, res) => {
  const { id, updatedFields } = req.body;
  io.emit("geofenceUpdated", { id, updatedFields });
  res.status(200).json({ success: true });
});

io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
});

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get("/", (req, res) => {
    const userAgent = req.headers['user-agent'] || '';

    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isRoku = /Roku/i.test(userAgent);
    const isSamsung = /SamsungBrowser|SmartTV|Tizen|Samsung/i.test(userAgent);
    const isLG = /Web0S|LG Browser|LGNetCast|NetCast|LG/i.test(userAgent);
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent);
  
    // if (isIOS) {
    //   // Redirect to iOS App Store
    //   return res.redirect("https://apps.apple.com/app/your-ios-app-id");
    // }
  
    // if (isAndroid) {
    //   // Redirect to Google Play Store
    //   return res.redirect("https://play.google.com/store/apps/details?id=your.android.package");
    // }
  
    if (isIOS) {
      // Redirect to Roku Channel
      return res.redirect("https://channelstore.roku.com/details/253188");
    }
  
    if (isSamsung) {
      // Redirect to Samsung Store (or your hosted Samsung app link)
      return res.redirect("https://www.samsung.com/us/appstore/app/GalaxyStore/your-samsung-app-id");
    }
  
    if (isLG) {
      // Redirect to LG Content Store (or hosted LG app link)
      return res.redirect("https://lgcontentstore.lgappstv.com/detail/your-lg-app-id");
    }
  
    if (isDesktop) {
      // Redirect to Web Version
      return res.redirect("https://kcwx.live");
    }
  
    // Fallback
    return res.redirect("https://kcwx.com");
    //redirect to kcwx.com
    // res.redirect("https://kcwx.com");

    

    // res.send("OTT_API AND MORE");

});

// Nested Routes
app.use("/api/user", UserRoutes);
app.use("/api/auth", LoginRoutes);
app.use("/api/cdn", CdnRoutes);
app.use("/api/stream", StreamingLocationRoutes);
app.use("/api/liveUser", LiveUserRoutes);
app.use("/api/global", GlobalGeoFencingRoutes);


const port = process.env.PORT || 8080;
var server = httpServer.listen(port, () => {
    Connect();
    console.log(`Server listening on ${port}`);
});

server.timeout = 100000;

module.exports = app;