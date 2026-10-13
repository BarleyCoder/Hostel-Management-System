"use strict";

const path = require("node:path");
const readline = require("node:readline");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config({ path: path.join(__dirname, ".env") });

class BootstrapError extends Error { }

function ask(question) {
      const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
      });

      return new Promise((resolve) => {
            rl.question(question, (answer) => {
                  rl.close();
                  resolve(answer);
            });
      });
}

function askHidden(question) {
      const input = process.stdin;

      if (!input.isTTY || typeof input.setRawMode !== "function") {
            return Promise.reject(
                  new BootstrapError("Run this script from an interactive terminal.")
            );
      }

      return new Promise((resolve, reject) => {
            let value = "";
            let finished = false;

            const cleanup = () => {
                  if (finished) return;
                  finished = true;
                  input.removeListener("data", onData);
                  input.setRawMode(false);
                  process.stdout.write("\n");
            };

            const onData = (chunk) => {
                  for (const character of chunk) {
                        if (character === "\u0003") {
                              cleanup();
                              reject(new BootstrapError("Input cancelled."));
                              return;
                        }

                        if (character === "\r" || character === "\n") {
                              cleanup();
                              resolve(value);
                              return;
                        }

                        if (character === "\u007f" || character === "\b") {
                              value = Array.from(value).slice(0, -1).join("");
                        } else if (character >= " ") {
                              value += character;
                        }
                  }
            };

            process.stdout.write(question);
            input.setEncoding("utf8");
            input.setRawMode(true);
            input.resume();
            input.on("data", onData);
      });
}

function isStrongPassword(password) {
      const characterCount = Array.from(password).length;
      const byteCount = Buffer.byteLength(password, "utf8");
      const characterClasses = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];
      const matchedClasses = characterClasses.filter((pattern) => pattern.test(password)).length;

      return characterCount >= 14 && byteCount <= 72 && matchedClasses >= 3;
}

async function main() {
      let password;
      let confirmation;

      try {
            if (!process.env.MONGODB_URI) {
                  throw new BootstrapError("MONGODB_URI is not configured in backend/.env.");
            }

            const fullName = (await ask("Admin full name: ")).trim();
            const email = (await ask("Admin email: ")).trim().toLowerCase();

            if (fullName.length < 2 || fullName.length > 100) {
                  throw new BootstrapError("Full name must be between 2 and 100 characters.");
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  throw new BootstrapError("Enter a valid email address.");
            }

            password = await askHidden("Admin password (input hidden): ");
            confirmation = await askHidden("Confirm password (input hidden): ");

            if (password !== confirmation) {
                  throw new BootstrapError("The passwords do not match.");
            }

            if (!isStrongPassword(password)) {
                  throw new BootstrapError(
                        "Use at least 14 characters, at least 3 character types (lowercase, uppercase, number, symbol), and no more than 72 UTF-8 bytes."
                  );
            }

            await mongoose.connect(process.env.MONGODB_URI);

            if (await User.exists({ email })) {
                  throw new BootstrapError(
                        "That email already belongs to an account. Nothing was changed."
                  );
            }

            if (await User.exists({ role: "admin" })) {
                  throw new BootstrapError(
                        "An admin account already exists. Nothing was changed."
                  );
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            password = "";
            confirmation = "";

            const admin = await User.create({
                  fullName,
                  email,
                  password: hashedPassword,
                  role: "admin"
            });

            console.log(`Admin account created successfully for ${admin.email}.`);
      } catch (error) {
            if (error instanceof BootstrapError) {
                  console.error(error.message);
            } else if (error && error.code === 11000) {
                  console.error("An account with that email already exists. Nothing was changed.");
            } else {
                  console.error(
                        "Admin bootstrap failed. No password was displayed; check the backend MongoDB configuration and connectivity."
                  );
            }

            process.exitCode = 1;
      } finally {
            password = "";
            confirmation = "";

            if (mongoose.connection.readyState !== 0) {
                  try {
                        await mongoose.disconnect();
                        console.log("MongoDB connection closed.");
                  } catch {
                        console.error("Could not confirm MongoDB connection cleanup.");
                        process.exitCode = 1;
                  }
            }
      }
}

if (require.main === module) {
      main();
}
