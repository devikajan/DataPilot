
import io
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile
from pypdf import PdfReader

from app.services.rag_service import index_document


router = APIRouter(
    prefix="/documents",
    tags=["RAG Documents"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".txt"}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = (file.filename or "").replace("\\", "/").split("/")[-1]
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if not filename or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported.",
        )

    try:
        contents = await file.read(MAX_FILE_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="The file exceeds the 10 MB limit.",
            )

        if extension == ".pdf":
            try:
                reader = PdfReader(io.BytesIO(contents))

                if reader.is_encrypted:
                    raise HTTPException(
                        status_code=400,
                        detail="Encrypted PDFs are not supported.",
                    )

                text = "\n".join(
                    page.extract_text() or ""
                    for page in reader.pages
                )

            except HTTPException:
                raise
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail="Could not read this PDF file.",
                )
        else:
            try:
                text = contents.decode("utf-8-sig")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="TXT files must use UTF-8 encoding.",
                )

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No extractable text was found in the file.",
            )

        document_id = str(uuid.uuid4())

        result = index_document(
            text=text,
            document_id=document_id,
            filename=filename,
        )

        return {
            "message": "Document uploaded and indexed successfully.",
            **result,
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to index the document. Check the API configuration and logs.",
        )
    finally:
        await file.close()
