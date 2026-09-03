import { getInitializedApp } from "../server/app";

export default async function handler(req: any, res: any) {
  const { app } = await getInitializedApp();
  return app(req, res);
}
