const sendError = (
  res,
  status = 500,
  message = "Something went wrong",
  extra = null,
  code = null
) => {
  const payload = {
    success: false,
    message,
  };

  if (code) payload.code = code;
  if (extra) payload.errors = extra;

  return res.status(status).json(payload);
};

module.exports = sendError;