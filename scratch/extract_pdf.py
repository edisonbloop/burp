import pdfplumber

pdf_path = "/Users/apple/Documents/web/burp/public/BURP — Design System.pdf"
output_path = "/Users/apple/Documents/web/burp/scratch/design_system_text.txt"

print(f"Reading PDF: {pdf_path}")
with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    text_content = []
    for i, page in enumerate(pdf.pages):
        print(f"Extracting page {i+1}...")
        text = page.extract_text()
        text_content.append(f"--- PAGE {i+1} ---\n{text or ''}\n")
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(text_content))

print(f"Done! Text saved to {output_path}")
