Adds GTIN & EAN Check to Software and Tools. I made it, so this is a self-submission.

It is a free Google Sheets add-on for UPC, EAN and GTIN codes. Amazon listings need one of these codes unless the brand has a GTIN exemption, and sellers usually keep them in a spreadsheet, where they break in ways that are hard to see: Sheets drops leading zeros, shows long codes as 5.90123E+12, and pasted data brings invisible characters. The add-on checks the check digit and length, finds these spreadsheet problems and repeated codes, and adds a report sheet with a link to each bad cell. It only has access to the open spreadsheet, and the codes stay there.

The two barcode tools already in the list make labels or search by code. This one checks that the codes are right before upload.

- [x] I read the [contribution guidelines](https://github.com/ScaleLeap/awesome-amazon-seller/blob/master/contributing.md).
- [ ] I added or changed only files in `data/entries/`, and I ran `npx projen`.
  I added the entry file and the matching line in `readme.md` in the generator's format, but I did not run `npx projen` locally. I will fix anything the build reports.
- [x] The description is short and factual, with no marketing text.
- [x] The URL has no affiliate or tracking parameters.
