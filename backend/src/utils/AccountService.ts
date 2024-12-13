import { parseFile, writeToStream } from "fast-csv";
import fs from "fs";

import User from "../types/User";

export default class AccountService {
  private csvFilepath: string;

  constructor(csvFilepath: string) {
    this.csvFilepath = csvFilepath;
  }

  // append a new row to a csv file
  async createAccount(username: string, password: string) {
    return new Promise((resolve, reject) => {
      const data = [{ username, password }];

      writeToStream(
        fs.createWriteStream(this.csvFilepath, {
          flags: "a",
        }),
        data,
        {
          includeEndRowDelimiter: true,
        }
      )
        .on("error", (err) => reject(err))
        .on("finish", () => resolve(true));
    });
  }

  // read all rows from csv file
  async getAccounts(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const result: User[] = [];
      parseFile(this.csvFilepath, { headers: false })
        .on("error", (err) => reject(err))
        .on("data", (row) => {
          result.push({ username: row[0], password: row[1] });
        })
        .on("end", () => {
          resolve(result);
        });
    });
  }
}
