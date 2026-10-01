import net from "net";

export function assertDocument(buffer: Buffer, originalName: string) {
  if (buffer.length === 0) throw new Error("The file is empty.");
  if (buffer.length > 10 * 1024 * 1024) throw new Error("The file is larger than 10 MB.");

  const name = originalName.toLowerCase().trim();
  const isPdf = name.endsWith(".pdf");
  const isDocx = name.endsWith(".docx");
  if (!isPdf && !isDocx) throw new Error("Only PDF or DOCX files are accepted.");
  if (name.endsWith(".docm") || name.endsWith(".exe") || name.includes("..")) {
    throw new Error("This file type is not accepted.");
  }

  if (isPdf && buffer.subarray(0, 5).toString("utf8") !== "%PDF-") {
    throw new Error("The file is not a valid PDF.");
  }

  if (isDocx) {
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      throw new Error("The file is not a valid DOCX.");
    }
    const probe = buffer.toString("latin1");
    if (probe.includes("vbaProject.bin")) {
      throw new Error("Macro-enabled documents are not accepted.");
    }
  }

  return isPdf ? "pdf" : "docx";
}

export async function scanBuffer(buffer: Buffer) {
  const signature = "signature-ok";
  const host = process.env.CLAMAV_HOST;
  if (!host) return signature;

  const port = Number(process.env.CLAMAV_PORT || 3310);
  const result = await new Promise<string>((resolve, reject) => {
    const socket = net.connect({ host, port });
    const chunks: Buffer[] = [];
    socket.setTimeout(20_000);
    socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("The virus scan timed out."));
    });
    socket.on("error", reject);
    socket.on("connect", () => {
      socket.write(Buffer.from("zINSTREAM\0"));
      const size = Buffer.alloc(4);
      size.writeUInt32BE(buffer.length, 0);
      socket.write(size);
      socket.write(buffer);
      socket.write(Buffer.alloc(4));
    });
    socket.on("close", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

  if (result.includes("FOUND")) throw new Error("The file failed the virus scan.");
  if (!result.includes("OK")) throw new Error("The virus scan was inconclusive.");
  return "clamav-clean";
}
