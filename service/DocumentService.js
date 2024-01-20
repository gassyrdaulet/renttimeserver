import {
  PatchType,
  patchDocument,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Paragraph,
} from "docx";

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
      const table = fields[field];
      const headers = Object.keys(table?.[0]);
      patches[field] = {
        type: PatchType.DOCUMENT,
        children: [
          new Table({
            columnWidths: [500, 500, 1300, 600, 600],
            rows: [
              new TableRow({
                children: headers.map(
                  (header) =>
                    new TableCell({
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
                      (key) =>
                        new TableCell({
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
