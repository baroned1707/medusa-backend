import multer from "multer";
import path from "path";
import { getConfigFile } from "medusa-core-utils";
import cors from "cors";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

export default (router, rootDirectory) => {
  const { configModule } = getConfigFile(rootDirectory, "medusa-config");
  const { projectConfig } = configModule;

  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  console.log("CORS", corsOptions);

  router.post(
    "/admin/uploads",
    cors(corsOptions),
    upload.array("files"),
    async (req, res) => {
      try {
        console.log("Override");
        const files = req.files;

        res.send({
          uploads: files.map((file) => {
            return {
              url: process.env.BACKEND_HOST + "/" + file.filename,
            };
          }),
        });
      } catch (e) {
        console.log(e);
        res.status(500).json({
          message: "BAD REQUEST",
        });
      }
    }
  );

  return router;
};
