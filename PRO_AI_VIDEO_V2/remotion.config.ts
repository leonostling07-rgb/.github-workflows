import { Config } from "remotion";

Config.setCodec("h264");
Config.setCrf(18);
Config.setImageFormat("png");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
