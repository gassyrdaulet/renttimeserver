import {
  PatchType,
  patchDocument,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Paragraph,
  WidthType,
  VerticalAlign,
  ImageRun,
} from "docx";
import QRCode from "qrcode";

function dataUriToBuffer(dataUri) {
  const base64 = dataUri.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  return buffer;
}

export async function updateText(doc, replacements) {
  const getPatches = (fields) => {
    const patches = {};
    for (const field in fields) {
      patches[field] = {
        type: PatchType.PARAGRAPH,
        children: [new TextRun({ text: fields[field] })],
      };
    }
    return patches;
  };
  const patches = getPatches(replacements);
  const updated = await patchDocument(doc, {
    outputType: "nodebuffer",
    patches,
    keepOriginalStyles: true,
  });
  return updated;
}

export async function updateTable(doc, replacements) {
  const getPatches = (fields) => {
    const patches = {};
    for (const field in fields) {
      const columnWidths = [500, 4500, 1500, 1500, 2000];
      const table = fields[field];
      const headers = Object.keys(table?.[0]);
      patches[field] = {
        type: PatchType.DOCUMENT,
        children: [
          new Table({
            columnWidths,
            width: {
              size: 10000,
              type: WidthType.DXA,
            },
            rows: [
              new TableRow({
                children: headers.map(
                  (header, index) =>
                    new TableCell({
                      width: {
                        size: columnWidths[index],
                        type: WidthType.DXA,
                      },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          text: header,
                          alignment: "center",
                        }),
                      ],
                    })
                ),
              }),
              ...table.map(
                (row) =>
                  new TableRow({
                    children: headers.map(
                      (key, index) =>
                        new TableCell({
                          width: {
                            size: columnWidths[index],
                            type: WidthType.DXA,
                          },
                          children: [new Paragraph(String(row?.[key]))],
                        })
                    ),
                  })
              ),
            ],
          }),
        ],
      };
    }
    return patches;
  };
  const patches = getPatches(replacements);
  const updated = await patchDocument(doc, {
    outputType: "nodebuffer",
    patches,
  });
  return updated;
}

export const updateQR = async (doc, replacements) => {
  const getPatches = async (fields) => {
    const patches = {};
    for (const field in fields) {
      const qrCodeDataUri = await QRCode.toDataURL(
        JSON.stringify(fields[field]),
        { margin: 2 }
      );
      const qrCodeImageData = dataUriToBuffer(qrCodeDataUri);
      patches[field] = {
        type: PatchType.PARAGRAPH,
        children: [
          new ImageRun({
            data: qrCodeImageData,
            transformation: {
              width: 70,
              height: 70,
            },
          }),
        ],
      };
    }
    return patches;
  };
  const patches = await getPatches(replacements);
  const updated = await patchDocument(doc, {
    outputType: "nodebuffer",
    patches,
    keepOriginalStyles: true,
  });
  return updated;
};
