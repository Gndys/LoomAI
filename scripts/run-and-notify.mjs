#!/usr/bin/env node
import { spawn } from "node:child_process";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function getPushplusConfig() {
  const token = process.env.PUSHPLUS_TOKEN;
  if (!token) return null;

  return {
    token,
    topic: process.env.PUSHPLUS_TOPIC,
    channel: process.env.PUSHPLUS_CHANNEL,
    template: process.env.PUSHPLUS_TEMPLATE,
  };
}

async function sendPushplus({ title, content }) {
  const config = getPushplusConfig();
  if (!config) return { skipped: true, reason: "PUSHPLUS_TOKEN not set" };

  const body = new URLSearchParams();
  body.set("token", config.token);
  body.set("title", title);
  body.set("content", content);
  if (config.topic) body.set("topic", config.topic);
  if (config.channel) body.set("channel", config.channel);
  if (config.template) body.set("template", config.template);

  const res = await fetch("https://www.pushplus.plus/send", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`pushplus http ${res.status}: ${text}`);

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function parseArgs(argv) {
  const dd = argv.indexOf("--");
  const cmd = dd === -1 ? argv.slice(2) : argv.slice(dd + 1);
  return cmd;
}

const cmd = parseArgs(process.argv);
if (cmd.length === 0) {
  console.error("Usage: pnpm notify -- <command...>");
  process.exit(2);
}

const startAt = Date.now();
const child = spawn(cmd[0], cmd.slice(1), { stdio: "inherit", shell: false });

child.on("exit", async (code, signal) => {
  const elapsedMs = Date.now() - startAt;
  const seconds = (elapsedMs / 1000).toFixed(1);
  const status = code === 0 ? "✅ 完成" : "❌ 失败";
  const title = `${status}：${cmd.join(" ")}`;
  const content = [
    `项目：${process.env.npm_package_name ?? "unknown"}`,
    `目录：${process.cwd()}`,
    `主机：${process.env.HOSTNAME ?? "unknown"}`,
    `耗时：${seconds}s`,
    code === 0 ? `退出码：0` : `退出码：${code ?? "null"}${signal ? ` (signal: ${signal})` : ""}`,
  ].join("\n");

  try {
    await sendPushplus({ title, content });
  } catch (err) {
    console.error("[notify] pushplus failed:", err?.message ?? err);
  } finally {
    process.exit(code ?? 1);
  }
});

child.on("error", async (err) => {
  try {
    await sendPushplus({
      title: `❌ 启动失败：${cmd.join(" ")}`,
      content: String(err?.message ?? err),
    });
  } catch (e) {
    console.error("[notify] pushplus failed:", e?.message ?? e);
  } finally {
    console.error(err);
    process.exit(1);
  }
});

