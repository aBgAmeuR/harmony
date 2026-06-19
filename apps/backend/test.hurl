POST http://localhost:3000/api/v1/packages
[Multipart]
file: file,data_nath.zip;

HTTP 202
[Asserts]
jsonpath "$.public_id" exists
jsonpath "$.status" == "pending"
