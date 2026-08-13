# TOOL REGISTRY
★ category = includes Tier1 tools with full prop schemas | other tools list action/trigger names only — params verified against Live API

## ★ CORE & FLOW CONTROL

### webhook  v2.0.4 | None
*Receive HTTP requests and trigger flows using unique URLs.*
**Triggers:** `catch_webhook`
**Actions:** `return_response` `return_response_and_wait_for_next_webhook`
`catch_webhook` props:
  liveMarkdown(MARKDOWN) //**Live URL:** ```text {{webhookUrl}} ``` generate sample dat
  syncMarkdown(MARKDOWN) //**Synchronous Requests:** If you expect a response from this
  testMarkdown(MARKDOWN) //**Test URL:** if you want to generate sample data without tr
  authType★(STATIC_DROPDOWN)='none' ["None"|"Basic Auth"|"Header Auth"]
  authFields(DYNAMIC)
`return_response` props:
  responseType(STATIC_DROPDOWN)='json' ["JSON"|"Raw"|"Redirect"]
  fields★(DYNAMIC)
  respond(STATIC_DROPDOWN)='stop' ["Stop"|"Respond and Continue"]
`return_response_and_wait_for_next_webhook` props:
  responseType(STATIC_DROPDOWN)='json' ["JSON"|"Raw"|"Redirect"]
  fields★(DYNAMIC)

### schedule  v2.0.0 | None
*Trigger flow with fixed schedule*
**Triggers:** `every_x_minutes` `every_hour` `every_day` `every_week` `every_month` `cron_expression`
`every_x_minutes` props:
  minutes★(STATIC_DROPDOWN)=1 //Valid value between 1 to 59.
`every_hour` props:
  run_on_weekends★(CHECKBOX)=false
`every_day` props:
  hour_of_the_day★(STATIC_DROPDOWN)=0
  timezone★(STATIC_DROPDOWN)='UTC'
  run_on_weekends★(CHECKBOX)=false
`every_week` props:
  day_of_the_week★(STATIC_DROPDOWN) ["Sunday"|"Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"]
  hour_of_the_day★(STATIC_DROPDOWN)
  timezone★(STATIC_DROPDOWN)='UTC'
`every_month` props:
  day_of_the_month★(STATIC_DROPDOWN)
  hour_of_the_day★(STATIC_DROPDOWN)
  timezone★(STATIC_DROPDOWN)='UTC'
`cron_expression` props:
  cronExpression★(SHORT_TEXT)='0/5 * * * *' //Cron expression to trigger
  timezone★(STATIC_DROPDOWN)='UTC'

### http  v2.0.0 | None
*Sends HTTP requests and return responses*
**Actions:** `send_request`
`send_request` props:
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  url★(SHORT_TEXT)
  headers★(OBJECT)
  queryParams★(OBJECT)
  authType★(STATIC_DROPDOWN)='NONE' ["None"|"Basic Auth"|"Bearer Token"]
  authFields(DYNAMIC)
  body_type(STATIC_DROPDOWN)='none' ["None"|"Form Data"|"JSON"|"Raw"]
  body(DYNAMIC)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc. A base64 body will 
  use_proxy(CHECKBOX)=false //Use a proxy for this request
  proxy_settings(DYNAMIC)
  timeout(NUMBER)
  failureMode(STATIC_DROPDOWN)='continue_none'
  stopFlow(CHECKBOX)

### http-oauth2  v2.0.0 | OAuth2
*Perform authenticated HTTP requests using OAuth2. Define your own authorization and token URLs to in*
**Actions:** `send-oauth2-request`
`send-oauth2-request` props:
  url★(SHORT_TEXT)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PUT"|"PATCH"|"DELETE"]
  headers(OBJECT)
  queryParams(OBJECT)
  body_type(STATIC_DROPDOWN)='none' ["None"|"Form Data"|"JSON"|"Raw"]
  body(DYNAMIC)
  use_proxy(CHECKBOX)=false //Use a proxy for this request
  proxy_settings(DYNAMIC)
  failsafe(CHECKBOX)
  timeout(NUMBER)

### delay  v2.0.0 | None
*Use it to delay the execution of the next action*
**Actions:** `delayFor` `delay_until`
`delayFor` props:
  unit★(STATIC_DROPDOWN)='seconds' ["Seconds"|"Minutes"|"Hours"|"Days"] //The unit of time to delay the execution of the next action
  delayFor★(NUMBER) //The number of units to delay the execution of the next actio
`delay_until` props:
  delayUntilTimestamp★(DATE_TIME) //Specifies the date and time until which the execution of the

### store  v2.0.0 | None
*Store or retrieve data from key/value database*
**Actions:** `get` `put` `append` `remove_value` `add_to_list` `remove_from_list`
`get` props:
  key★(SHORT_TEXT)
  defaultValue(SHORT_TEXT)
  store_scope★(STATIC_DROPDOWN)='COLLECTION' ["Project"|"Flow"|"Run"] //The storage scope of the value.
`put` props:
  key★(SHORT_TEXT)
  value★(SHORT_TEXT)
  store_scope★(STATIC_DROPDOWN)='COLLECTION' ["Project"|"Flow"|"Run"] //The storage scope of the value.
`append` props:
  key★(SHORT_TEXT)
  value★(SHORT_TEXT)
  separator(SHORT_TEXT) //Separator between added values, use \n for newlines
  store_scope★(STATIC_DROPDOWN)='COLLECTION' ["Project"|"Flow"|"Run"] //The storage scope of the value.
`remove_value` props:
  key★(SHORT_TEXT)
  store_scope★(STATIC_DROPDOWN)='COLLECTION' ["Project"|"Flow"|"Run"] //The storage scope of the value.
`add_to_list` props:
  key★(SHORT_TEXT)
  value★(ARRAY)
  ignore_if_exists(CHECKBOX)
  store_scope★(STATIC_DROPDOWN)='COLLECTION' ["Project"|"Flow"|"Run"] //The storage scope of the value.
`remove_from_list` props:
  key★(SHORT_TEXT)
  value★(SHORT_TEXT)
  store_scope★(STATIC_DROPDOWN)='COLLECTION' ["Project"|"Flow"|"Run"] //The storage scope of the value.

### subflows  v2.0.1 | None
*Trigger and call another sub flow.*
**Triggers:** `callableFlow`
**Actions:** `callFlow` `returnResponse`
`callableFlow` props:
  mode★(STATIC_DROPDOWN)='simple' ["Simple"|"Advanced"] //Choose Simple for key-value or Advanced for JSON.
  exampleData★(DYNAMIC) //The schema to be passed to the flow
`callFlow` props:
  flow★(DROPDOWN) //The flow to execute
  mode★(STATIC_DROPDOWN)='simple' ["Simple"|"Advanced"] //Choose Simple for key-value or Advanced for JSON.
  flowProps★(DYNAMIC)
  waitForResponse(CHECKBOX)=false
`returnResponse` props:
  mode★(STATIC_DROPDOWN)='simple' ["Simple"|"Advanced"] //Choose Simple for key-value or Advanced for JSON.
  response★(DYNAMIC)

### flow-helper  v2.0.0 | None
*Utilities for managing flow execution. Retrieve the current run ID, or programmatically stop or fail*
**Actions:** `getRunId` `failFlow` `stopFlow`
`failFlow` props:
  message★(LONG_TEXT) //The error message to show when the flow fails.

### tables  v2.0.0 | None
*Store and manage your data in structured tables. Create, update, delete, and search for records, and*
**Triggers:** `newRecord` `updatedRecord` `deletedRecord`
**Actions:** `tables-create-records` `tables-delete-record` `tables-update-record` `tables-get-record` `tables-find-records`
`newRecord` props:
  table_id★(DROPDOWN)
`updatedRecord` props:
  table_id★(DROPDOWN)
`deletedRecord` props:
  table_id★(DROPDOWN)
`tables-create-records` props:
  table_id★(DROPDOWN)
  values★(DYNAMIC) //The records to create.
`tables-delete-record` props:
  table_id★(DROPDOWN)
  records_ids★(ARRAY) //The IDs of the records to delete
`tables-update-record` props:
  table_id★(DROPDOWN)
  record_id★(SHORT_TEXT) //The ID of the record to do the action on.
  values★(DYNAMIC) //The values to update. Leave empty to keep current value.
`tables-get-record` props:
  table_id★(DROPDOWN)
  record_id★(SHORT_TEXT) //The ID of the record to do the action on.
`tables-find-records` props:
  table_id★(DROPDOWN)
  limit(NUMBER) //Maximum number of records to return (default no limit).
  filters(DYNAMIC) //Filter conditions to apply

### tags  v2.0.0 | None
*Add custom tags to your run for filtration*
**Actions:** `add_tag`
`add_tag` props:
  info(MARKDOWN) //This action add a tag to the current execution, this tag can
  name★(SHORT_TEXT)

### connections  v2.0.0 | None
*Read connections dynamically*
**Actions:** `read_connection`
`read_connection` props:
  info(MARKDOWN) //**Advanced Piece** <br> Use this piece if you are unsure whi
  connection_name★(SHORT_TEXT)

### forms  v2.0.0 | None
*Trigger a flow through human input.*
**Triggers:** `form_submission` `chat_submission`
**Actions:** `return_response`
`form_submission` props:
  about(MARKDOWN) //**Published Form URL:** ```text {{formUrl}} ``` Use this for
  response(MARKDOWN) //If **Wait for Response** is enabled, use **Respond on UI** i
  waitForResponse★(CHECKBOX)=false
  inputs★(ARRAY)
`chat_submission` props:
  about(MARKDOWN) //**Published Chat URL:** ```text {{chatUrl}} ``` Use this for
  responseMarkdown(MARKDOWN) //This trigger sets up a chat interface. Ensure that **Respond
  botName★(SHORT_TEXT)='AI Bot' //The name of the chatbot
`return_response` props:
  file(FILE)

### approval  v2.0.0 | None
*Build approval process in your workflows*
**Actions:** `wait_for_approval` `create_approval_links`

### todos  v2.0.0 | None
*Create tasks for project members to take actions, useful for approvals, reviews, and manual actions *
**Actions:** `createTodo` `wait_for_approval` `createTodoAndWait`
`createTodo` props:
  title★(SHORT_TEXT)
  description(LONG_TEXT) //These details will be displayed for the assignee. Add the fu
  assigneeId(DROPDOWN)
  statusOptions★(ARRAY)
`wait_for_approval` props:
  taskId★(SHORT_TEXT) //The ID of the task to wait for approval
`createTodoAndWait` props:
  title★(SHORT_TEXT)
  description(LONG_TEXT) //These details will be displayed for the assignee. Add the fu
  assigneeId(DROPDOWN)
  statusOptions★(ARRAY)

### mcp  v2.0.0 | None
*Connect to your hosted MCP Server using any MCP client to communicate with tools*
**Triggers:** `mcp_tool`
**Actions:** `reply_to_mcp_client`
`mcp_tool` props:
  toolName★(SHORT_TEXT) //Used to call this tool from MCP clients like Claude Desktop,
  toolDescription★(LONG_TEXT) //Used to describe what this tool does and when to use it
  inputSchema(ARRAY) //Define the input parameters that this tool accepts. Paramete
  returnsResponse★(CHECKBOX)=false //Keep the MCP client waiting until it receives a response via
`reply_to_mcp_client` props:
  note(MARKDOWN) //**Important**: Make sure your MCP trigger has (Wait for Resp
  mode★(STATIC_DROPDOWN)='simple' ["Simple"|"Advanced"] //Choose Simple for key-value or Advanced for JSON.
  response★(DYNAMIC)
  respond(STATIC_DROPDOWN)='stop' ["Stop"|"Respond and Continue"]

### queue  v2.0.0 | None
*A piece that allows you to push items into a queue, providing a way to throttle requests or process *
**Actions:** `push-to-queue` `pull-from-queue` `clear-queue`
`push-to-queue` props:
  info(MARKDOWN) //**Note:** - You can push items from other flows. The queue n
  queueName★(SHORT_TEXT)
  items★(ARRAY)
`pull-from-queue` props:
  info(MARKDOWN) //**Note:** - You can pull items from other flows. The queue n
  queueName★(SHORT_TEXT)
  numOfItems★(NUMBER)
`clear-queue` props:
  info(MARKDOWN) //**Note:** - This deletes all items inside the queue permanen
  queueName★(SHORT_TEXT)

## ★ PUCHO AI TOOLS (Native)

### llm-ai  v2.1.1 | None
*Query multiple AI language models with custom prompts*
**Actions:** `askLlm`
`askLlm` props:
  model★(DROPDOWN) //Select the AI model to use for generating responses
  puchoModelKey(CUSTOM) //Hidden field for Pucho Model Key
  puchoProviderName(CUSTOM) //Hidden field for Pucho Provider Name
  query★(LONG_TEXT) //Enter your question or prompt for the selected model
  temperature(NUMBER)=0.7 //Controls randomness in the response (0.0 to 1.0)
  maxTokens(STATIC_DROPDOWN) ["500"|"1000"|"1500"|"2000"|"2500"] //Maximum number of tokens to generate
  maxTokensNote(MARKDOWN) //If you do not select any value, the max limit will be consid

### image-ai  v2.1.1 | None
*Generate images from text prompts using AI models*
**Actions:** `generateImage`
`generateImage` props:
  model★(DROPDOWN) //Select the AI model to use for generating images
  puchoModelKey(CUSTOM) //Hidden field for Pucho Model Key
  puchoProviderName(CUSTOM) //Hidden field for Pucho Provider Name
  query★(LONG_TEXT) //Enter your prompt or description for image generation
  aspect_ratio(DROPDOWN) //Select the aspect ratio for the generated image
  references(DYNAMIC) //Reference images for models that support them

### text-ai  v2.1.1 | None
*Generate intelligent text content and responses*
**Actions:** `askTextAI`
`askTextAI` props:
  query★(LONG_TEXT) //Enter your question, prompt, or text generation request

### video-ai  v2.2.1 | None
*Create videos from text with AI-powered generation*
**Actions:** `generateVideoJobId` `checkVideoStatus`
`generateVideoJobId` props:
  model★(DROPDOWN) //Select the AI model to use for generating videos
  duration★(DROPDOWN) //Select the duration of the video
  resolution★(DROPDOWN) //Select the video resolution
  aspectRatio★(DROPDOWN) //Select the video aspect ratio
  puchoModelKey(CUSTOM) //Hidden field for Pucho Model Key
  puchoProviderName(CUSTOM) //Hidden field for Pucho Provider Name
  query★(LONG_TEXT) //Enter your prompt or description for video generation
  imageUrls(DYNAMIC) //Image URLs (only for veo-3.1-generate-preview model)
`checkVideoStatus` props:
  jobId★(SHORT_TEXT) //Enter the job ID from the video generation job (e.g., models
  waitForCompletion(CHECKBOX)=false //If enabled, the action will poll the status until the video 
  pollInterval(NUMBER)=10 //How often to check the status when waiting for completion (d
  maxWaitTime(NUMBER)=300 //Maximum time to wait for video completion (default: 300 seco

### ai-voice-call  v2.1.2 | None
*Make intelligent voice calls with AI agents*
**Actions:** `voiceCall` `getCallDetails`
`voiceCall` props:
  aiVoiceCall★(DROPDOWN) //Select AI Voice Call Connection
  connectionDetails(DYNAMIC)
`getCallDetails` props:
  requestId★(SHORT_TEXT) //Enter the request ID to get AI voice call details

### web-search  v2.1.1 | None
*Search the web with AI-powered intelligent responses*
**Actions:** `webSearch`
`webSearch` props:
  query★(LONG_TEXT) //Enter your search query or question for web search

### ocr-analytics  v2.1.1 | None
*Extract and analyze text from images and PDFs*
**Actions:** `askImage/PDF`
`askImage/PDF` props:
  model★(DROPDOWN) //Select the AI model to use for processing the image/PDF
  url★(SHORT_TEXT) //Enter the URL of the image or PDF file. Only .pdf, .png, .jp
  puchoModelKey(CUSTOM) //Hidden field for Pucho Model Key
  puchoProviderName(CUSTOM) //Hidden field for Pucho Provider Name
  query★(LONG_TEXT) //Enter your question about the image or PDF

### speech-intelligence  v2.1.1 | None
*Convert text to speech and speech to text using AI models*
**Actions:** `textToSpeech` `speechToText`
`textToSpeech` props:
  model★(DROPDOWN) //Select the AI model to use for text-to-speech conversion
  voice★(DROPDOWN) //Select the voice to use for text-to-speech conversion
  prompt★(LONG_TEXT) //Enter the text prompt to convert to speech
  instructions(LONG_TEXT) //Optional instructions for how to speak (e.g., "Speak clearly
`speechToText` props:
  model★(DROPDOWN) //Select the AI model to use for speech-to-text conversion
  url★(SHORT_TEXT) //Enter the URL of the audio file (direct URL or signed URL). 

### utility-ai  v2.1.1 | None
*Utility AI provides common AI helpers powered by your Pucho studio models, including content moderat*
**Actions:** `checkModeration` `classifyText` `extractStructuredData`
`checkModeration` props:
  puchoModel(DROPDOWN) //Uses Pucho studio models when OpenAI moderation is not confi
  manualProvider(SHORT_TEXT) //If the model list fails to load, enter the provider name her
  manualModel(SHORT_TEXT) //If the model list fails to load, enter the model id here (e.
  text(LONG_TEXT)
  images(ARRAY)
`classifyText` props:
  model★(DROPDOWN) //Select the AI model used for classification.
  text★(LONG_TEXT)
  categories★(ARRAY) //Categories to classify text into.
`extractStructuredData` props:
  model(DROPDOWN) //Select the AI model used for extraction.
  manualProvider(SHORT_TEXT) //If the model list fails to load, enter the provider name her
  manualModel(SHORT_TEXT) //If the model list fails to load, enter the model id here (e.
  text(LONG_TEXT) //Text to extract structured data from.
  files(ARRAY)
  prompt(LONG_TEXT) //Prompt to guide the AI.
  mode★(STATIC_DROPDOWN)='simple' ["Simple"|"Advanced"] //For complex schema, you can use advanced mode.
  schama★(DYNAMIC)
  maxOutputTokens(NUMBER)=2000

### scrape-fusion  v2.1.1 | None
*Scrape single pages or entire websites with flexible extraction formats*
**Actions:** `single_page_scraping` `whole_website_scraping`
`single_page_scraping` props:
  url★(SHORT_TEXT) //The URL of the page to scrape
  extractionType★(STATIC_DROPDOWN) ["Markdown"|"Summary"|"HTML"|"Raw HTML"|"Links"|"Images"|"JSON"] //Choose how you want the content to be extracted
`whole_website_scraping` props:
  url★(SHORT_TEXT) //The root URL of the website to scrape
  maxPages★(STATIC_DROPDOWN)=3 ["1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"] //Maximum number of pages to crawl and scrape (1–10)
  extractionType★(STATIC_DROPDOWN) ["Markdown"|"Summary"|"HTML"|"Raw HTML"|"Links"|"Images"|"JSON"] //Choose how you want the content to be extracted

### tallyconnection  v2.1.5 | None
*Get insights from your Tally data*
**Actions:** `askTally` `ask_tally_template`
`askTally` props:
  tallyconnection★(DROPDOWN) //Select Tally Connection
  query★(LONG_TEXT) //Enter your query
`ask_tally_template` props:
  tallyconnection★(DROPDOWN) //Select Tally Connection
  template★(DROPDOWN) //Select a template question
  variables(DYNAMIC)
**Template catalog (`template` = id below; `variables` fills `<ITEM_NAME>`/`<PARTY_NAME>` placeholders):**
  1: Recent transaction history of <ITEM_NAME>
  2: How much did we spend last month?
  3: Show me latest 5 sales of <ITEM_NAME>
  4: Display recent purchase entries for <ITEM_NAME>
  5: Daily cash collection from customers
  6: List all suppliers with negative balance
  7: Show me customers with outstanding credit balance
  8: Give me a list of all ledger balances.
  9: Top 10 Product Sales
  10: What are the top expenses this month?
  11: <ITEM_NAME> STOCK wise Sale
  12: Who are the top 5 creditors by amount
  13: Who are the top 5 debtors by amount
  14: Stock position of <ITEM_NAME>
  15: Display party wise closing balance summary
  16: What's the closing balance for the Bank account?
  17: Which ledgers have negative balances?
  18: Which inventory items currently have fewer than 10 units in stock?
  19: Show me all items that currently have zero stock on hand.
  20: Find all accounts with negative purchase ledger balance
  21: What percentage of our sales were cash sales versus credit sales?
  27: Party wise Products wise Sale report
  28: Show me vendor wise credit balance report
  29: Last Top 5 sales transaction of <ITEM_NAME>
  30: List of negative closing balance of Purchase Party
  31: <ITEM_NAME> purchase
  32: Show me all Cash ledger transactions for this month
  33: Show me the complete ledger report for all accounts, including opening balances.
  34: Show outstanding bills with due date and overdue days.
  35: Show negative accounts receivable per party.
  36: Show daily cash receipts and payments.
  37: Show parent groups of Loans & Advances (Asset).
  38: Show all child groups under Loans & Advances (Asset).
  39: Show income and expense ledger balances with stock adjustments.
  40: Show daily purchase amounts.
  41: Show monthly purchase amounts.
  42: Show all purchases with party, ledger, and amount.
  43: Show daily sales including days with no transactions.
  44: Show total sales per month including months with no sales.
  45: Show sales register with party and ledger details.
  46: Show stock balances and movements for items.
  47: Show item-wise batch opening balance and transactions.
  48: Show trial balance for all ledgers.
  49: What's the total amount our customers owe us as of today?
  50: What is the current fund position (cash & bank)?
  51: Are there any stock discrepancies or negative stock reports?
  52: Show me products with zero movement in last 2 years
  53: Not moving Inventory since last 1 year
  54: List all purchase vouchers for this month.
  55: What's the total quantity and value of stock returns (sales returns) this year?
  56: Sales performance of <ITEM_NAME>
  57: Product wise Party wise Purchase Report
  58: What is the opening and closing balance of bank and cash accounts?
  59: What are the sales returns recorded in this month.
  60: What is the total purchase for this month
  61: Cash Payment more than 5000
  62: Salary Expenses of this month
  63: List expenses above 50000 in this month
  64: Total Sales Bill created in this month
  65: Top five sales Bill
  66: Give Trial Balances for this year
  67: What is the total outstanding receivable.
  68: What is the trial balance for this financial year
  69: What are the compressed air/diesel/steam usage summaries?
  70: What are the non-operating incomes and their sources?
  71: Show me movement of <ITEM_NAME>
  72: Top 10 Customers Payment Performance Report
  73: Show all vouchers for today.
  74: Who are our debtors and how much do they owe?
  75: Sundry debtors wise Products wise Sale
  76: What's the total stock value we're holding across all items right now?
  77: What are the sales returns recorded in this month.
  78: What is my GST liability?
  79: What is my output GST?
  80: What is my input GST?
  81: What is net GST payable?
  82: What is GST summary for this month?
  83: Compare GST last 3 months
  84: Receivables aging analysis (debtor aging)
  85: Payables aging analysis (creditor aging)
  86: Show ledger statement for <PARTY_NAME>
  87: Monthly sales vs purchase comparison
  88: Show purchase returns (debit notes) for this month
  89: Top 10 customers by sales value this year
  90: Show bank account statement for this month
  91: Show profit and loss summary for this financial year
  92: Show payment voucher register for this month
  93: Show receipt voucher register for this month
  94: Any duplicate entries today?
  95: What is today's net cash flow?
  96: What is today's inflow vs outflow?
  97: What is my gross GST on sales?
  98: What is my net GST on sales?
  99: What is my gross GST on purchase?
  100: What is my net GST on purchase?
  101: What is total TDS deducted?
  102: Any duplicate entries?
  103: Total contra entry with value
  104: Who are top 5 pending payment customers?
  105: How many sales invoices created today?
  106: Which products sold the most today?
  107: Which customers bought today?
  108: What is today's discount given and received?
  109: What purchases were made today?
  111: What is today's purchase value?
  113: What is today's inward stock summary?
  114: What is today's salary payout?
  115: Any advance given to employees today?
  116: Daily petty cash summary
  117: What is today's operational cost?
  118: Which bank transactions happened today?
  119: Which deposits cleared today?
  120: Give me all customers and suppliers with missing or blank GSTN, Address, or Mobile
  121: Bank ledger entries for the last 30 days
  122: Expense ledger summary grouped by Ledger Name
  123: What are the vendor payables (outstanding amount)?
  124: Give me payment voucher data
  125: Any pending sales orders for this financial year?
  126: Give me today's total sales and invoice count
  127: Give me today's total expenses and breakdown by expense heads
  128: Today vs last week sales comparison
  129: Overall and today's cash and bank ledger balances
  130: Previous month sales register with details
  131: Weekly MIS data for the last 7 days
  132: Show vendor payables with invoice details
  133: Get all sales vouchers with details for last financial year.
  134: Show customer aging analysis
  135: Customer wise outstanding bills with due date and overdue days
  136: Full receivables aging report for each outstanding party
  137: Get all purchase vouchers for this financial year
  138: What are the customer receivables (outstanding amount)?
  139: Show customer receivables with risk level and due status
  140: Give data of sales transactions
  141: Give me all customers and suppliers with missing or blank fields
  142: Get last 90 days purchase vouchers for vendors
  143: Give me total profit with P&L component breakdown
  144: Give me the closing stock summary for all stock locations/branches.
  145: Customer wise purchase history of all items
  146: Provide me all sales quotation data
  147: Provide me transactions of all customers
  148: Provide outward tax, inward tax and net GST liability for current quarter
  149: Give me all customer details
  150: Provide all vendor details
  151: Get current cash position of last week also Return daily expected inflow schedule.
  152: Get all batch-wise inventory details

## ★ UTILITY & PROCESSING

### crypto  v2.0.0 | None
*Generate random passwords and hash existing text*
**Actions:** `hash-text` `hmac-signature` `generate-password` `base64-decode` `base64-encode` `openpgpEncrypt`
`hash-text` props:
  method★(STATIC_DROPDOWN) ["MD5"|"SHA256"|"SHA512"|"SHA3-512"] //The hashing algorithm to use
  text★(SHORT_TEXT) //The text to be hashed
`hmac-signature` props:
  secretKey★(SHORT_TEXT) //The secret key to encrypt
  secretKeyEncoding★(STATIC_DROPDOWN) ["UTF-8"|"Hex"|"Base64"] //The secret key encoding to use
  method★(STATIC_DROPDOWN) ["MD5"|"SHA256"|"SHA512"] //The hashing algorithm to use
  text★(SHORT_TEXT) //The text to be hashed and encrypted
`generate-password` props:
  length★(NUMBER) //The length of the password (maximum 256)
  characterSet★(STATIC_DROPDOWN)='alphanumeric' ["Alphanumeric"|"Alphanumeric + Symbols"] //The character set to use when generating the password
`base64-decode` props:
  text★(SHORT_TEXT) //The text to be decoded.
`base64-encode` props:
  text★(SHORT_TEXT) //The text to be encoded.
`openpgpEncrypt` props:
  file★(FILE) //The file to encrypt
  publicKey★(LONG_TEXT) //The PGP public key in ASCII armor format

### csv  v2.0.0 | None
*Manipulate CSV text*
**Actions:** `convert_csv_to_json` `convert_json_to_csv`
`convert_csv_to_json` props:
  csv_text★(LONG_TEXT)
  has_headers★(CHECKBOX)=false
  delimiter_type★(STATIC_DROPDOWN) ["Comma"|"Tab"] //Select the delimiter type for the CSV text.
`convert_json_to_csv` props:
  json_array★(JSON) //Provide a JSON array to convert to CSV format.
  delimiter_type★(STATIC_DROPDOWN)=',' ["Comma"|"Tab"] //Select the delimiter type for the CSV file.

### xml  v2.0.0 | None
*Extensible Markup Language for storing and transporting data*
**Actions:** `convert-json-to-xml`
`convert-json-to-xml` props:
  json★(JSON)
  attributes_key(SHORT_TEXT) //Field to add your tag's attributes
  header(CHECKBOX) //Add XML header

### json  v2.0.0 | None
*Convert JSON to text and vice versa*
**Actions:** `convert_json_to_text` `convert_text_to_json`
`convert_json_to_text` props:
  json★(JSON)
`convert_text_to_json` props:
  text★(LONG_TEXT)

### file-helper  v2.0.0 | None
*Read file content and return it in different formats.*
**Actions:** `read_file` `createFile` `change_file_encoding` `checkFileType` `zipFiles` `unzipFile`
`read_file` props:
  file★(FILE)
  readOptions★(STATIC_DROPDOWN) ["Text"|"Base64"] //The output format
`createFile` props:
  content★(LONG_TEXT)
  fileName★(SHORT_TEXT)
  encoding★(STATIC_DROPDOWN)='utf8' ["ASCII"|"UTF-8"|"UTF-16LE"|"UCS-2"|"Base64"|"Base64 URL"|"Latin1"|"Binary"|"Hex"]
`change_file_encoding` props:
  inputFile★(FILE)
  inputEncoding★(STATIC_DROPDOWN) ["ASCII"|"UTF-8"|"UTF-16LE"|"UCS-2"|"Base64"|"Base64 URL"|"Latin1"|"Binary"|"Hex"]
  outputFileName★(SHORT_TEXT)
  outputEncoding★(STATIC_DROPDOWN) ["ASCII"|"UTF-8"|"UTF-16LE"|"UCS-2"|"Base64"|"Base64 URL"|"Latin1"|"Binary"|"Hex"]
`checkFileType` props:
  file★(FILE)
  mimeTypes★(STATIC_DROPDOWN) //Choose one or more MIME types to check against the file.
`zipFiles` props:
  files★(ARRAY)
  outputFileName★(SHORT_TEXT)
`unzipFile` props:
  file★(FILE)
  maxResults(NUMBER)=0 //Throw an error if zip file has more than expected entries. -

### image-helper  v2.0.0 | None
*Tools for image manipulations*
**Actions:** `image_to_base64` `get_meta_data` `crop_image` `rotate_image` `resize_image` `compress_image`
`image_to_base64` props:
  image★(FILE) //The image to convert
  override_mime_type(SHORT_TEXT) //The mime type to use when converting the image. In case you 
`get_meta_data` props:
  image★(FILE)
`crop_image` props:
  image★(FILE)
  left★(NUMBER) //Specifies the horizontal position, indicating where the crop
  top★(NUMBER) //Represents the vertical position, indicating the starting po
  width★(NUMBER) //Determines the horizontal size of the cropped area.
  height★(NUMBER) //Determines the vertical size of the cropped area.
  resultFileName(SHORT_TEXT) //Specifies the output file name for the cropped image (withou
`rotate_image` props:
  image★(FILE)
  degree★(STATIC_DROPDOWN) ["90°"|"180°"|"270°"] //Specifies the degree of clockwise rotation applied to the im
  resultFileName(SHORT_TEXT) //Specifies the output file name for the result image (without
`resize_image` props:
  image★(FILE)
  width★(NUMBER) //Specifies the width of the image.
  height★(NUMBER) //Specifies the height of the image.
  aspectRatio(CHECKBOX)=false
  resultFileName(SHORT_TEXT) //Specifies the output file name for the result image (without
`compress_image` props:
  image★(FILE)
  quality★(STATIC_DROPDOWN) ["High Quality"|"Lossy Quality"] //Specifies the quality of the image after compression (0-100)
  format★(STATIC_DROPDOWN) ["JPG"|"PNG"] //Specifies the format of the image after compression.
  resultFileName(SHORT_TEXT) //Specifies the output file name for the result image (without

### text-helper  v2.0.0 | None
*Tools for text processing*
**Actions:** `concat` `replace` `split` `find` `markdown_to_html` `html_to_markdown` `stripHtml` `slugify` `defaultValue`
`concat` props:
  texts★(ARRAY)
  separator(SHORT_TEXT) //The text that separates the texts you want to concatenate
`replace` props:
  text★(SHORT_TEXT)
  searchValue★(SHORT_TEXT) //Can be plain text or a regex expression.
  replaceValue(SHORT_TEXT) //Leave empty to delete found results.
  replaceOnlyFirst(CHECKBOX) //Only replaces the first instance of the search value.
`split` props:
  text★(SHORT_TEXT)
  delimiter★(SHORT_TEXT)
`find` props:
  text★(SHORT_TEXT)
  expression★(SHORT_TEXT) //Regex or text to search for.
`markdown_to_html` props:
  flavor★(STATIC_DROPDOWN)='github' ["Default"|"Original"|"GitHub"] //The flavor of markdown use during conversion
  headerLevelStart★(NUMBER)=1 //The minimum header level to use during conversion
  tables★(CHECKBOX)=true //Whether to support tables during conversion
  noHeaderId★(CHECKBOX)=false //Whether to add an ID to headers during conversion
  simpleLineBreaks★(CHECKBOX)=false //Parses line breaks as &lt;br&gt;, without needing 2 spaces a
  openLinksInNewWindow★(CHECKBOX)=false
`html_to_markdown` props:
  html★(LONG_TEXT) //The HTML to convert to markdown
`stripHtml` props:
  html★(LONG_TEXT)
`slugify` props:
  text★(SHORT_TEXT)
`defaultValue` props:
  value(SHORT_TEXT) //Enter value
  defaultString★(SHORT_TEXT)

### math-helper  v2.0.0 | None
*Perform mathematical operations.*
**Actions:** `addition_math` `subtraction_math` `multiplication_math` `division_math` `modulo_math` `generateRandom_math`
`addition_math` props:
  first_number★(NUMBER)
  second_number★(NUMBER)
`subtraction_math` props:
  first_number★(NUMBER)
  second_number★(NUMBER)
`multiplication_math` props:
  first_number★(NUMBER)
  second_number★(NUMBER)
`division_math` props:
  first_number★(NUMBER)
  second_number★(NUMBER)
`modulo_math` props:
  first_number★(NUMBER)
  second_number★(NUMBER)
`generateRandom_math` props:
  first_number★(NUMBER)
  second_number★(NUMBER)

### date-helper  v2.0.0 | None
*Manipulate, format, and extract time units for all your date and time needs.*
**Actions:** `get_current_date` `format_date` `extract_date_parts` `date_difference` `add_subtract_date` `next_day_of_week` `next_day_of_year`
`get_current_date` props:
  timeFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  timeZone★(STATIC_DROPDOWN)='UTC'
`format_date` props:
  inputDate★(SHORT_TEXT) //Enter the input date
  inputFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  inputTimeZone★(STATIC_DROPDOWN)='UTC'
  outputFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  outputTimeZone★(STATIC_DROPDOWN)='UTC'
`extract_date_parts` props:
  inputDate★(SHORT_TEXT) //Enter the input date
  inputFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  unitExtract★(STATIC_MULTI_SELECT_DROPDOWN) ["Year"|"Month"|"Day"|"Hour"|"Minute"|"Second"|"Day of Week"|"Month name"] //Select the unit to extract from the date
`date_difference` props:
  startDate★(SHORT_TEXT) //Enter the starting date
  startDateFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  endDate★(SHORT_TEXT) //Enter the ending date
  endDateFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  unitDifference★(STATIC_MULTI_SELECT_DROPDOWN) ["Year"|"Month"|"Day"|"Hour"|"Minute"|"Second"] //Select the unit of difference between the two dates
`add_subtract_date` props:
  inputDate★(SHORT_TEXT) //Enter the input date
  inputDateFormat★(STATIC_DROPDOWN)='ddd MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  outputFormat★(STATIC_DROPDOWN)='ddd MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  expression★(LONG_TEXT) //Provide an expression to add or subtract using the following
`next_day_of_week` props:
  weekday★(STATIC_DROPDOWN) ["Sunday"|"Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"] //The weekday that you would like to get the date and time of.
  time(SHORT_TEXT)='00:00' //The time that you would like to get the date and time of. Th
  currentTime(CHECKBOX)=false //If checked, the current time will be used instead of the tim
  timeFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  timeZone★(STATIC_DROPDOWN)='UTC'
`next_day_of_year` props:
  month★(STATIC_DROPDOWN) //The month that you would like to get the date and time of.
  day★(NUMBER)=1 //The day of the month that you would like to get the date and
  time(SHORT_TEXT)='00:00' //The time that you would like to get the date and time of. Th
  currentTime(CHECKBOX)=false //If checked, the current time will be used instead of the tim
  timeFormat★(STATIC_DROPDOWN)='DDD MMM DD YYYY HH:mm:ss' //Here's what each part of the format (e.g., YYYY) represents:
  timeZone★(STATIC_DROPDOWN)='UTC'

### data-mapper  v2.0.0 | None
*tools to manipulate data structure*
**Actions:** `advanced_mapping`
`advanced_mapping` props:
  mapping★(JSON) //The mapping to use

### data-summarizer  v2.0.0 | None
*Summarize data with ease. Calculate sums, averages, find minimum/maximum values, and count unique it*
**Actions:** `calculateAverage` `calculateSum` `countUniques` `getMinMax`
`calculateAverage` props:
  note(MARKDOWN) //If you'd like to use the values with a previous step, click 
  values★(ARRAY)
`calculateSum` props:
  note(MARKDOWN) //If you'd like to use the values with a previous step, click 
  values★(ARRAY)
`countUniques` props:
  note(MARKDOWN) //If you'd like to use the values with a previous step, click 
  values★(ARRAY)
  fieldsExplanation(MARKDOWN) //If the data you're passing in is an object, you can specify 
  fields(ARRAY)
`getMinMax` props:
  note(MARKDOWN) //If you'd like to use the values with a previous step, click 
  values★(ARRAY)

### graphql  v2.0.0 | None
*Execute GraphQL queries and mutations. Interact with any GraphQL API by providing the endpoint, quer*
**Actions:** `send_request`
`send_request` props:
  method★(STATIC_DROPDOWN)='POST' ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  url★(SHORT_TEXT)
  queryParams★(OBJECT)
  headers★(OBJECT)
  query★(LONG_TEXT)
  variables(JSON)
  use_proxy(CHECKBOX)=false //Use a proxy for this request
  proxy_settings(DYNAMIC)
  timeout(NUMBER)
  failsafe(CHECKBOX)

### pdf  v2.0.0 | None
*Extract, convert, and generate PDFs (text/images/pages) with no authentication.*
**Actions:** `extractText` `convertToImage` `textToPdf` `imageToPdf` `pdfPageCount` `extractPdfPages`
`extractText` props:
  file★(FILE)
`convertToImage` props:
  file★(FILE)
  imageOutputType★(STATIC_DROPDOWN)='multiple' ["Single Combined Image"|"Separate Image for Each Page"]
`textToPdf` props:
  text★(LONG_TEXT) //Enter text to convert
`imageToPdf` props:
  image★(FILE) //Image has to be png, jpeg or jpg and it will be scaled down 
`pdfPageCount` props:
  file★(FILE)
`extractPdfPages` props:
  file★(FILE)
  pageRanges★(ARRAY)

### soap  v2.0.0 | Custom(type,username,password,customHeader)
*Simple Object Access Protocol for communication between applications*
**Actions:** `call_method`

### base64-image  v2.0.3 | None
*Convert a base64-encoded image into a permanent, accessible image URL.*
**Actions:** `convert_base64_to_file`
`convert_base64_to_file` props:
  base64★(LONG_TEXT) //The base64-encoded image data (with or without the data URI 
  fileName★(SHORT_TEXT) //Optional file name (e.g. photo.png, image.jpg, picture.webp)
  mimeType(SHORT_TEXT) //Optional image MIME type (e.g. image/png, image/jpeg, image/

## ★ AI MODELS

### hugging-face  v2.0.0 | API Key
*Run inference on 100,000+ open ML models for NLP, vision, and audio tasks*
**Actions:** `document_question_answering` `language_translation` `text_classification` `text_summarization` `chat_completion` `create_image` `object_detection` `image_classification`

### deepgram  v2.0.0 | API Key
*Deepgram is an AI-powered speech recognition platform that provides real-time transcription, text-to*
**Actions:** `create_summary` `create_transcription_callback` `list_projects` `text_to_speech` `custom_api_call`

### cometapi  v2.0.0 | API Key
*Access multiple AI models through CometAPI - unified interface for GPT, Claude, Gemini, and more.*
**Actions:** `ask-cometapi` `custom_api_call`

### agent  v2.0.0 | None
*Let an AI assistant help you with tasks using tools.*
**Actions:** `run_agent`

### docsbot  v2.0.0 | API Key
*DocsBot AI allows you to build AI-powered chatbots that pull answers from your existing documentatio*
**Actions:** `askQuestion` `createSource` `uploadSourceFile` `createBot` `findBot` `custom_api_call`

### copy-ai  v2.0.0 | API Key
*AI-powered content generation and copywriting platform*
**Triggers:** `workflow_run_completed`
**Actions:** `run_workflow` `get_workflow_run_status` `get_workflow_run_outputs`

### dappier  v2.0.0 | API Key
*Enable fast, free real-time web search and access premium data from trusted media brands—news, finan*
**Actions:** `real_time_web_search` `stock_market_data_search` `sports_news_search` `lifestyle_news_search`

### firecrawl  v2.0.0 | API Key
*Extract structured data from websites using AI with natural language prompts*
**Actions:** `scrape` `startCrawl` `crawlResults` `custom_api_call`

### apify  v2.0.0 | Custom(apikey)
*Your full‑stack platform for web scraping*
**Actions:** `getDatasetItems` `getActors` `getLastRun` `startActor`

### browserless  v2.0.0 | Custom(apiToken,region,customBaseUrl)
*Browserless is a headless browser automation tool that allows you to scrape websites, take screensho*
**Actions:** `capture_screenshot` `generate_pdf` `scrape_url` `run_bql_query` `get_website_performance`

### cody  v2.0.0 | API Key
*Build and manage AI assistants with Cody. Create documents, upload files, manage conversations, and *
**Actions:** `create_document_from_text` `upload_file` `send_message` `create_conversation` `find_bot` `find_conversation` `custom_api_call`

### fireflies-ai  v2.0.0 | API Key
*Meeting assistant that automatically records, transcribes, and analyzes conversations*
**Triggers:** `new_transcription_completed`
**Actions:** `find-meeting-by-id` `find_recent_meeting` `find_meeting_by_query` `upload_audio` `get-user-details`

### avoma  v2.0.0 | API Key
*Avoma is an AI Meeting Assistant that automatically records, transcribes, and summarizes your meetin*
**Triggers:** `new_note` `new_meeting_scheduled` `meeting_rescheduled` `meeting_cancelled`
**Actions:** `create_call` `get_meeting_recording` `get_meeting_transcription`

### bumpups  v2.0.0 | API Key
*Generate creator content, hashtags, and engagement with Bumpups.*
**Actions:** `generateCreatorDescription` `generateCreatorHashtags` `generateCreatorTakeaways` `generateCreatorTitles` `generateTimestamps` `send_chat` `custom_api_call`

### pinecone  v2.0.0 | Custom(apiKey)
*Manage vector databases, store embeddings, and perform similarity searches*
**Actions:** `create_index` `upsert_vector` `update_vector` `get_vector` `delete_vector` `search_vector` `search_index`

### qdrant  v2.0.0 | Custom(serverAddress,key)
*Make any action on your qdrant vector database*
**Actions:** `add_points_to_collection` `collection_list` `collection_infos` `delete_collection` `delete_points` `get_points` `search_points`

### personal-ai  v2.0.0 | API Key
*Manage memory storage, messaging, and documents through AI integration.*
**Actions:** `create_memory` `create_message` `create_chatgpt_instruction` `create_custom_training` `get_conversation` `upload_document` `upload_file` `upload_url` `update_document` `get_document`

### comfyicu  v2.0.0 | API Key
*Run and manage ComfyUI workflows on Comfy.ICU. Automate workflow submissions, track run status, and *
**Triggers:** `new-workflow-created` `run-completed` `run-failed`
**Actions:** `get-run-output` `get-run-status` `list-workflows` `submit-workflow-run`

### gistly  v2.0.0 | API Key
*YouTube Transcripts*
**Actions:** `get_transcript`

### mindee  v2.0.0 | API Key
*Document automation API*
**Actions:** `mindee_predict_document` `custom_api_call`

### vlm-run  v2.0.0 | API Key
*VLM Run is a visual AI platform that extracts data from images, videos, audio, and documents. It hel*
**Actions:** `analyzeAudio` `analyzeImage` `analyzeDocument` `analyzeVideo` `getFile` `custom_api_call`

### scrapeless  v2.0.0 | API Key
*Scrapeless is an all-in-one and highly scalable web scraping toolkit for enterprises and developers.*
**Actions:** `google_search_api` `crawl_scrape` `crawl_crawl` `google_trends_api` `universal_scraping_api` `custom_api_call`

### straico  v2.0.0 | API Key
*All-in-one generative AI platform*
**Actions:** `prompt_completion` `image_generation` `file_upload` `create_rag` `list_rags` `get_rag_by_id` `update_rag` `delete_rag` `rag_prompt_completion` `agent-create` `agent-add-rag` `agent-list` `agent_delete` `agent_update` `agent_get` `agent_prompt_completion` `custom_api_call`

### prompthub  v2.0.0 | API Key
*Integrate with PromptHub projects, retrieve heads, and run prompts.*
**Actions:** `list_projects` `get_project_head` `run_prompt` `custom_api_call`

### pdf-co  v2.0.0 | API Key
*Automate PDF conversion, editing, extraction*
**Actions:** `add_barcode_to_pdf` `add_image_to_pdf` `add_text_to_pdf` `convert_html_to_pdf` `convert_pdf_to_structured_format` `extract_tables_from_pdf` `extract_text_from_pdf` `search_and_replace_text`

### pdfmonkey  v2.0.0 | API Key
*Generate PDFs at scale with PDFMonkey. Automate document generation from templates, manage documents*
**Triggers:** `documentGenerated`
**Actions:** `generateDocument` `deleteDocument` `findDocument` `custom_api_call`

### peekshot  v2.0.0 | API Key
*Capture high-quality screenshots of any website with PeekShot. Automate web snapshots for your repor*
**Actions:** `captureScreenshot` `custom_api_call`

### placid  v2.0.0 | API Key
*Creative automation engine that generates dynamic images, PDFs, and videos from templates and data.*
**Actions:** `create_image` `create_pdf` `create_video` `convert_file_to_url` `get_image` `get_pdf` `get_video` `custom_api_call`

### bannerbear  v2.0.0 | API Key
*Automate image generation*
**Actions:** `bannerbear_create_image` `custom_api_call`

### generatebanners  v2.0.0 | Basic Auth
*Image generation API for banners and social media posts*
**Actions:** `render_template`

### apitemplate-io  v2.0.0 | Custom(region,apiKey)
*Generate PDFs and images from templates, HTML, or URLs with APITemplate.io.*
**Actions:** `createImage` `createPdfFromHtml` `createPdfFromUrl` `createPdf` `deleteObject` `getAccountInformation` `listObjects` `custom_api_call`

### gamma  v2.0.1 | Custom(apiKey)
*An AI-powered design partner that helps users generate presentations, documents, social media posts,*
**Actions:** `generateGamma` `getGeneration`

### magicslides  v2.0.0 | Custom(accessId,email)
*Create PowerPoint presentations from topics, summaries, or YouTube videos using AI.*
**Actions:** `createPptFromTopic` `createPptFromText` `createPptFromYoutube`

### slidespeak  v2.0.0 | API Key
*Interact with your documents and presentations using AI with SlideSpeak. Upload documents, create or*
**Triggers:** `new-presentation`
**Actions:** `create-presentation` `edit-presentation` `get-task-status` `upload-docuemnt` `custom_api_call`

### photoroom  v2.0.0 | Custom(apiKey)
*Edit your photos with Photoroom. Effortlessly remove backgrounds from your images to create professi*
**Actions:** `removeBackground`

### supadata  v2.0.0 | API Key
*YouTube Transcripts*
**Actions:** `get_transcript`

### serp-api  v2.0.0 | API Key
*Search Google, YouTube, News, and Trends with powerful filtering and analysis capabilities*
**Actions:** `google_search` `google_news_search` `youtube_search` `google_trends_search`

### serpstat  v2.0.0 | API Key
*Analyze keywords, get search suggestions, and access SEO data programmatically using Serpstat’s powe*
**Actions:** `get_keywords` `get_suggestions` `custom_api_call`

### webscraping-ai  v2.0.0 | API Key
*WebScraping AI is a powerful tool that allows you to scrape websites and extract data.*
**Actions:** `askAQuestionAboutTheWebPage` `getPageHtml` `scrapeWebsiteText` `extractStructuredData` `getAccountInformation`

## ★ VOICE & CALLING

### aircall  v2.0.0 | Basic Auth
*Manage calls, contacts, and messages with Aircall. Automate call logging, note creation, and contact*
**Triggers:** `callEnded` `newContact` `newNote` `newNumberCreated` `newSms`
**Actions:** `commentACall` `createAContact` `findCalls` `findContact` `getCall` `tagACall` `updateContact` `custom_api_call`
`commentACall` props:
  callId★(DROPDOWN)
  content★(LONG_TEXT)
`createAContact` props:
  phone_numbers★(ARRAY)
  first_name(SHORT_TEXT)
  last_name(SHORT_TEXT)
  company_name(SHORT_TEXT)
  information(LONG_TEXT) //Additional information about the contact.
  emails(ARRAY) //Array of email addresses (optional, max 20)
`findCalls` props:
  direction(STATIC_DROPDOWN) ["Inbound"|"Outbound"] //Filter by call direction
  phone_number(SHORT_TEXT) //The calling or receiving phone number of calls.
  tags(MULTI_SELECT_DROPDOWN)
`findContact` props:
  phone_number(SHORT_TEXT) //Search by phone number (with country code, e.g., +1234567890
  email(SHORT_TEXT) //Search by email address.
`getCall` props:
  callId★(DROPDOWN)
`tagACall` props:
  callId★(DROPDOWN)
  tags(MULTI_SELECT_DROPDOWN)
`updateContact` props:
  contactId★(DROPDOWN) //Select the contact to update
  first_name(SHORT_TEXT)
  last_name(SHORT_TEXT) //Last name of the contact
  company_name(SHORT_TEXT)
  information(LONG_TEXT) //Additional information about the contact
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### krisp-call  v2.0.0 | Custom(apiKey)
*KrispCall is a cloud telephony system for modern businesses, offering advanced features for high-gro*
**Triggers:** `newVoicemail` `newMms` `newContact` `newCallLog` `OutboundSMS/MMS`
**Actions:** `addContact` `deleteContacts` `sendSms` `sendMms`

### open-phone  v2.0.0 | API Key
*Manage your business communications with OpenPhone. Automate messaging, contact management, and trac*
**Triggers:** `call_recording_completed` `outgoing_message_delivered` `outgoing_call_completed` `incoming_call_completed` `incoming_message_received`
**Actions:** `send_message` `create_contact` `update_contact` `get_call_summary`

### timelines-ai  v2.0.0 | API Key
*Manage your WhatsApp communications with TimelinesAI. Automate sending messages and files to existin*
**Triggers:** `chatClosed` `newOutgoingChat` `newIncomingChat` `newSentMessage` `newReceivedMessage` `newUploadedFile` `newWhatsappAccount`
**Actions:** `sendMessageToExistingChat` `sendUploadedFileToExistingChat` `sendFileToExistingChat` `sendMessageToNewChat` `closeChat` `findChat` `findMessage` `findUploadedFile` `findMessageStatus` `findWhatsappAccount` `custom_api_call`

### rounded-studio  v2.0.0 | API Key
*Make and manage phone calls with Call-rounded.*
**Actions:** `custom_api_call`

## ★ GOOGLE WORKSPACE

### gmail  v2.0.4 | OAuth2
*Email service by Google*
**Triggers:** `gmail_new_email_received` `new_labeled_email` `gmail_new_attachment` `gmail_new_thread` `gmail_new_email_matching` `gmail_new_starred_email`
**Actions:** `send_email` `gmail_get_mail` `gmail_search_mail` `gmail_get_thread` `create_draft` `add_label_to_email` `reply_to_email` `create_draft_reply` `create_label` `remove_label_from_email` `remove_label_from_thread` `gmail_find_email` `custom_api_call`

### google-sheets  v2.0.9 | OAuth2
*Read, write, search, and manage data in Google Sheets spreadsheets. Supports inserting rows, updatin*
**Triggers:** `googlesheets_new_row_added` `google-sheets-new-or-updated-row` `new-spreadsheet` `new-worksheet` `googlesheets_new_row_added_team_drive` `google-sheets-new-or-updated-row-team-drive`
**Actions:** `insert_row` `google-sheets-insert-multiple-rows` `delete_row` `update_row` `find_rows` `create-spreadsheet` `create-worksheet` `clear_sheet` `find_row_by_num` `get_next_rows` `get_all_rows` `find_spreadsheets` `find-worksheet` `copy-worksheet` `update-multiple-rows` `create-column` `export_sheet` `find-or-create-worksheet` `find-or-create-row` `insert_row_at_top` `clear_rows` `lookup_spreadsheet_rows` `delete-worksheet` `rename-worksheet` `get_cell_value` `update_cell_value` `count_rows` `list-worksheets` `custom_api_call`
`googlesheets_new_row_added` props:
  info(MARKDOWN) //Please note that there might be a delay of up to 3 minutes f
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
`google-sheets-new-or-updated-row` props:
  info(MARKDOWN) //Please note that there might be a delay of up to 3 minutes f
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  trigger_column(DROPDOWN) //Trigger on changes to cells in this column only.Select **All
`new-spreadsheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
`new-worksheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN)
`googlesheets_new_row_added_team_drive` props:
  info(MARKDOWN) //Please note that there might be a delay of up to 3 minutes f
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
`google-sheets-new-or-updated-row-team-drive` props:
  info(MARKDOWN) //Please note that there might be a delay of up to 3 minutes f
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  trigger_column(DROPDOWN) //Trigger on changes to cells in this column only. Select **Al
`insert_row` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  as_string(CHECKBOX) //Inserted values that are dates and formulas will be entered 
  first_row_headers★(CHECKBOX)=true //Set to true if the first row of the sheet contains column he
  values★(DYNAMIC) //The values to insert
`google-sheets-insert-multiple-rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  input_type★(STATIC_DROPDOWN)='column_names' ["CSV"|"JSON"|"Column Names"] //Select the format of the input values to be inserted into th
  values★(DYNAMIC) //The values to insert.
  overwrite(CHECKBOX)=false //Enable this option to replace all existing data in the sheet
  check_for_duplicate(CHECKBOX)=false //Enable this option to check for duplicate values before inse
  check_for_duplicate_column(DYNAMIC) //The column to check for duplicate values.
  as_string(CHECKBOX) //Inserted values that are dates and formulas will be entered 
`delete_row` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  rowId★(NUMBER) //The row number to remove
`update_row` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  row_id★(NUMBER) //The row number to update
  first_row_headers★(CHECKBOX)=true //Set to true if the first row of the sheet contains column he
  values★(DYNAMIC) //The values to insert
`find_rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  columnName★(DROPDOWN) //Column Name
  searchValue(SHORT_TEXT) //The value to search for in the specified column. If left emp
  matchCase★(CHECKBOX)=false //Whether to choose the rows with exact match or choose the ro
  startingRow(NUMBER) //The row number to start searching from
  numberOfRows(NUMBER)=1 //The number of rows to return ( the default is 1 if not speci
`create-spreadsheet` props:
  title★(SHORT_TEXT) //The title of the new spreadsheet.
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  folder(DROPDOWN) //The folder to create the worksheet in.By default, the new wo
`create-worksheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN)
  title★(SHORT_TEXT) //The title of the new worksheet.
  headers(ARRAY)
`clear_sheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  is_first_row_headers★(CHECKBOX)=true //If the first row is headers
`find_row_by_num` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  rowNumber★(NUMBER) //The row number to get from the sheet
`get_next_rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  startRow★(NUMBER)=1 //Which row to start from?
  memKey★(SHORT_TEXT)='row_number' //The key used to store the current row number in memory
  groupSize★(NUMBER)=1 //The number of rows to get
`get_all_rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  startRow★(NUMBER)=1 //Which row to start from?
  memKey(SHORT_TEXT)='row_number' //The key used to store the current row number in memory
  groupSize★(NUMBER)=1 //The number of rows to get
`find_spreadsheets` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheet_name★(SHORT_TEXT) //The name of the spreadsheet(s) to find.
  exact_match(CHECKBOX)=false //If true, only return spreadsheets that exactly match the nam
`find-worksheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN)
  title★(SHORT_TEXT)
  exact_match(CHECKBOX)=false //If true, only return worksheets that exactly match the name.
`copy-worksheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN)
  sheetId★(DROPDOWN)
  desinationSpeadsheetId★(DROPDOWN)
`update-multiple-rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  values★(DYNAMIC) //The values to update.
  as_string(CHECKBOX) //Inserted values that are dates and formulas will be entered 
`create-column` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  columnName★(SHORT_TEXT)
  columnIndex(NUMBER) //The column index starts from 1.For example, if you want to a
`export_sheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  format★(STATIC_DROPDOWN)='csv' ["Comma Separated Values (.csv)"|"Tab Separated Values (.tsv)"] //The format to export the sheet to.
  returnAsText(CHECKBOX)=false //Return the exported data as text instead of a file.
`find-or-create-worksheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN)
  title★(SHORT_TEXT) //The title of the worksheet to find or create.
  headers(ARRAY) //Headers to add if a new worksheet is created.
`find-or-create-row` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  first_row_headers★(CHECKBOX)=true //Set to true if the first row of the sheet contains column he
  search_column★(SHORT_TEXT) //The column name to search in (case-sensitive, must match hea
  search_value★(SHORT_TEXT) //The value to search for in the specified column.
  values★(DYNAMIC) //The values to insert
`insert_row_at_top` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  first_row_headers★(CHECKBOX)=true //Set to true if the first row of the sheet contains column he
  values★(DYNAMIC) //The values to insert
`clear_rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  row_numbers★(ARRAY) //The row numbers to clear (1-based, e.g. 2 for the second row
`lookup_spreadsheet_rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  lookupColumn★(DROPDOWN) //Column Name
  lookupValue★(SHORT_TEXT) //Value to search for in the lookup column.
  returnColumn★(DROPDOWN) //Column Name
  exactMatch★(CHECKBOX)=true //Should the lookup be an exact match?
  returnAllMatches★(CHECKBOX)=false //Return all matching rows, not just the first.
`delete-worksheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The spreadsheet containing the worksheet to delete.
  sheetId★(DROPDOWN) //The worksheet (tab) to delete.
`rename-worksheet` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The spreadsheet containing the worksheet to rename.
  sheetId★(DROPDOWN) //The worksheet (tab) to rename.
  newTitle★(SHORT_TEXT) //The new title/name for the worksheet.
`get_cell_value` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  cellReference★(SHORT_TEXT) //The cell to read in A1 notation (e.g. A1, B5, C10, AA1).
`update_cell_value` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
  cellReference★(SHORT_TEXT) //The cell to update in A1 notation (e.g. A1, B5, C10, AA1).
  value★(SHORT_TEXT) //The new value to set in the cell.
  as_string(CHECKBOX)=false //If enabled, the value will be entered as a raw string (dates
`count_rows` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The unique ID of the Google Sheets spreadsheet to use. This 
  sheetId★(DROPDOWN) //The ID of the sheet to use.
`list-worksheets` props:
  includeTeamDrives(CHECKBOX)=false //Determines if sheets from Team Drives should be included in 
  spreadsheetId★(DROPDOWN) //The spreadsheet to list worksheets from.
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-drive  v2.0.4 | OAuth2
*Google Drive file storage — create, upload, search, share, move, copy, delete, and organize files an*
**Triggers:** `new_file` `new_folder` `new_file_in_folder` `updated_file`
**Actions:** `create_new_gdrive_folder` `create_new_gdrive_file` `upload_gdrive_file` `read-file` `get-file-or-folder-by-id` `list-files` `search-folder` `duplicate_file` `save_file_as_pdf` `update_permissions` `delete_permissions` `set_public_access` `google-drive-move-file` `delete_gdrive_file` `trash_gdrive_file` `copy_file` `create_file_from_text` `replace_file` `add_file_sharing_preference` `create_shortcut` `update_file_folder_name` `api_request` `retrieve_files` `find_file` `retrieve_file_by_id` `find_folder` `find_multiple_files` `find_or_create_folder` `find_or_create_file` `get_storage_info` `list_shared_drives` `get_file_sharing_info` `custom_api_call`
`new_file` props:
  parentFolder(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
  include_file_content(CHECKBOX)=false //Include the file content in the output. This will increase t
`new_folder` props:
  parentFolder(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`new_file_in_folder` props:
  parentFolder★(DROPDOWN) //Select the specific folder you want to monitor for new files
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
  include_file_content(CHECKBOX)=false //Include the file content in the output. This will increase t
`updated_file` props:
  parentFolder(DROPDOWN) //Select a specific folder to monitor, or leave empty to monit
  include_team_drives(CHECKBOX)=false //Determines if files from Team Drives should be included in t
  include_file_content(CHECKBOX)=false //Include the file content in the output. This will increase t
`create_new_gdrive_folder` props:
  title★(SHORT_TEXT) //The name of the new folder
  folder_id(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`create_new_gdrive_file` props:
  title★(SHORT_TEXT) //The name of the new text file
  text★(LONG_TEXT) //The text content to add to file
  fileType★(STATIC_DROPDOWN)='plain/text' ["Text"|"CSV"|"XML"] //Select file type
  folder_id(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`upload_gdrive_file` props:
  title★(SHORT_TEXT) //The name of the file
  file★(FILE) //The file URL or base64 to upload
  folder_id(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`read-file` props:
  file_id★(SHORT_TEXT) //The unique ID of the Google Drive file to read. You can get 
  title(SHORT_TEXT)
`get-file-or-folder-by-id` props:
  file_id★(SHORT_TEXT) //The unique ID of the file or folder. You can get this from t
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`list-files` props:
  folder_id★(SHORT_TEXT) //The ID of the folder to list files from
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
  includeTrashed(CHECKBOX)=false //Include new files that have been trashed.
  downloadFiles(CHECKBOX)=false //Download all file contents in a list
`search-folder` props:
  queryTerm★(STATIC_DROPDOWN)='name' ["File name"|"Full text search"|"Content type"] //The Query term or field of file/folder to search upon.
  operator★(STATIC_DROPDOWN)='contains' ["Contains"|"Equals"] //The operator to create criteria.
  search_text★(SHORT_TEXT) //Value of the field of file/folder to search for.
  type(STATIC_DROPDOWN)='all' ["All"|"Files"|"Folders"|"All Files/Folders"] //(Optional) Choose between files and folders.
  folder_id(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`duplicate_file` props:
  file_id★(SHORT_TEXT) //The ID of the file to duplicate
  title★(SHORT_TEXT) //The name of the duplicated file
  folder_id(DROPDOWN)
  mimeType(STATIC_DROPDOWN) ["Google Sheets"|"Google Docs"] //If left unselected the file will be duplicated as it is
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`save_file_as_pdf` props:
  documentId★(SHORT_TEXT) //The ID of the document to export
  folder_id(DROPDOWN)
  name★(SHORT_TEXT) //The name of the new file (do not include the extension)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`update_permissions` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder to update permissions for
  user_email★(SHORT_TEXT) //The email address of the user to update permissions for
  permission_name★(STATIC_DROPDOWN) ["Organizer"|"File Organizer"|"Writer"|"Commenter"|"Reader"] //The role to grant to user. See more at: https://developers.g
  send_invitation_email★(CHECKBOX) //Send an email to the user to notify them of the new permissi
`delete_permissions` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder to update permissions for
  user_email★(SHORT_TEXT) //The email address of the user to update permissions for
  permission_name★(STATIC_DROPDOWN) ["Organizer"|"File Organizer"|"Writer"|"Commenter"|"Reader"] //The role to remove from user.
`set_public_access` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder to update permissions for
`google-drive-move-file` props:
  file_id★(SHORT_TEXT) //The ID of the file to move
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
  folder_id(DROPDOWN)
`delete_gdrive_file` props:
  file_id★(SHORT_TEXT) //The ID of the file to delete
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`trash_gdrive_file` props:
  file_id★(SHORT_TEXT) //The ID of the file to trash
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`copy_file` props:
  file_id★(SHORT_TEXT) //The ID of the file you want to copy. You can use the "Search
  title★(SHORT_TEXT) //The name for the copied file
  folder_id(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`create_file_from_text` props:
  title★(SHORT_TEXT) //The name of the file (including extension). You can use {{tr
  content★(LONG_TEXT) //The text content to add to the file
  fileType★(STATIC_DROPDOWN)='text/plain' //Select the type of file you want to create
  folder_id(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`replace_file` props:
  file_id★(SHORT_TEXT) //The ID of the file you want to replace. You can use the "Sea
  newContent(LONG_TEXT) //The new content to replace the existing file content
  title(SHORT_TEXT) //Optionally provide a new name for the file. Leave empty to k
  fileType(STATIC_DROPDOWN) //Select the type of file (this will override the original fil
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`add_file_sharing_preference` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder to set sharing preferences for.
  sharingType★(STATIC_DROPDOWN)='email' //Select how you want to share the file or folder
  emailAddress(SHORT_TEXT) //The email address of the user or group to share with (requir
  sendNotificationEmail(CHECKBOX)=true //Send an email notification to the user/group about the share
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`create_shortcut` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder you want to create a shortcut t
  title(SHORT_TEXT) //The name for the shortcut (optional - will use original name
  folder_id(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`update_file_folder_name` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder you want to rename. You can use
  title★(SHORT_TEXT) //The new name for the file or folder
  renameFolder(CHECKBOX)=false //Check this if you are renaming a folder. Leave unchecked for
  folderOptions(STATIC_DROPDOWN)='none' ["None"|"Preserve folder structure"|"Update folder permissions"|"Create backup of old name"] //Additional options when renaming folders
  preserveSubfolders(CHECKBOX)=true //Keep all subfolders and their contents when renaming a folde
  updateSharingSettings(CHECKBOX)=false //Update sharing settings for the renamed folder
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`api_request` props:
  method★(STATIC_DROPDOWN)='GET' ["GET"|"POST"|"PUT"|"PATCH"|"DELETE"] //The HTTP method to use for the request
  endpoint★(SHORT_TEXT)='/files' //The Google Drive API endpoint (e.g., /files, /files/{fileId}
  queryParams(LONG_TEXT) //Query parameters as JSON object (e.g., {"pageSize": "10", "f
  requestBody(LONG_TEXT) //Request body as JSON (for POST, PUT, PATCH requests)
  includeTeamDrives(CHECKBOX)=false //Include files from Team Drives in the response
`retrieve_files` props:
  folder_id(DROPDOWN)
  fileType(STATIC_DROPDOWN) ["All Files"|"Documents"|"Spreadsheets"|"Presentations"|"Images"|"Videos"|"PDFs"|"Text Files"|"Folders Only"] //Filter by specific file types
  includeTrashed(CHECKBOX)=false //Include files that have been moved to trash
  sortBy(STATIC_DROPDOWN)='modifiedTime' //Sort the results by this field
  maxResults(NUMBER)=100 //Maximum number of files to retrieve (1-1000)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`find_file` props:
  searchType★(STATIC_DROPDOWN)='name' ["Search by Name"|"Search by ID"|"Full Text Search"|"Search by Content Type"|"Search by Owner"|"Search by Date Range"] //Choose how you want to search for files. "name" is most comm
  search_text★(SHORT_TEXT) //The value to search for (file name, ID, content type, etc.)
  searchOperator(STATIC_DROPDOWN)='contains' ["Contains"|"Equals"|"Starts with"|"Ends with"] //The operator to use for the search (only applies to name and
  searchDrive(DROPDOWN) //Select the drive to search in
  folder_id(DROPDOWN)
  fileType(STATIC_DROPDOWN) ["All Types"|"Files Only"|"Folders Only"|"Documents"|"Spreadsheets"|"Presentations"|"Images"|"Videos"|"PDFs"] //Filter results by file type
  includeTrashed(CHECKBOX)=false //Include files that have been moved to trash
  maxResults(NUMBER)=10 //Maximum number of files to return (1-100)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`retrieve_file_by_id` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder you want to retrieve. You can g
  includePermissions(CHECKBOX)=false //Include permission information for the file/folder
  includeRevisions(CHECKBOX)=false //Include revision history for the file (only applies to files
  includeTeamDrives(CHECKBOX)=false //Include files from Team Drives in the search
`find_folder` props:
  searchType★(STATIC_DROPDOWN)='name' ["Search by Name"|"Search by ID"|"Search by Owner"|"Search by Date Created"|"Search by Date Modified"] //Choose how you want to search for folders
  search_text★(SHORT_TEXT) //The value to search for (folder name, ID, owner email, or da
  searchOperator(STATIC_DROPDOWN)='contains' ["Contains"|"Equals"|"Starts with"|"Ends with"] //The operator to use for the search (only applies to name sea
  folder_id(DROPDOWN)
  includeTrashed(CHECKBOX)=false //Include folders that have been moved to trash
  includeSubfolders(CHECKBOX)=false //Search recursively in subfolders (may take longer)
  maxResults(NUMBER)=10 //Maximum number of folders to return (1-100)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`find_multiple_files` props:
  searchCriteria★(STATIC_DROPDOWN)='name' //Choose the primary search criteria for finding files
  search_text★(SHORT_TEXT) //The value to search for (file name, content type, owner emai
  searchOperator(STATIC_DROPDOWN)='contains' ["Contains"|"Equals"|"Starts with"|"Ends with"|"Greater than"|"Less than"|"Greater than or equal"|"Less than or equal"] //The operator to use for the search
  parentFolder(DROPDOWN)
  fileTypeFilter(STATIC_DROPDOWN) ["All Files"|"Documents"|"Spreadsheets"|"Presentations"|"Images"|"Videos"|"PDFs"|"Text Files"|"Audio Files"|"Archives"] //Filter results by specific file types
  includeTrashed(CHECKBOX)=false //Include files that have been moved to trash
  sortBy(STATIC_DROPDOWN)='modifiedTime desc' //Sort the results by this field
  maxResults(NUMBER)=100 //Maximum number of files to return (1-1000)
  includeFileDetails(CHECKBOX)=false //Include comprehensive file metadata (owners, permissions, et
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`find_or_create_folder` props:
  title★(SHORT_TEXT) //The name of the folder to find or create
  folder_id(DROPDOWN)
  createIfNotFound(CHECKBOX)=true //Create the folder if it doesn't exist (default: true)
  folderDescription(LONG_TEXT) //Description for the folder (only used when creating a new fo
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`find_or_create_file` props:
  title★(SHORT_TEXT) //The name of the file to find or create (including extension)
  folder_id(DROPDOWN)
  createIfNotFound(CHECKBOX)=true //Create the file if it doesn't exist (default: true)
  fileType(STATIC_DROPDOWN)='text/plain' //Select the type of file to create if it doesn't exist
  initialContent(LONG_TEXT) //Initial content for the file (only used when creating a new 
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`list_shared_drives` props:
  maxResults(NUMBER)=100 //Maximum number of shared drives to return (1-100)
`get_file_sharing_info` props:
  file_id★(SHORT_TEXT) //The ID of the file or folder. Use "Find a File" or "Find a F
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-docs  v2.0.0 | OAuth2
*Create and edit documents online*
**Triggers:** `new-document` `new_document_in_folder`
**Actions:** `create_document` `create_document_based_on_template` `create_document_from_template` `create_document_from_text` `upload_document` `read_document` `google-docs-find-document` `api_request` `custom_api_call` `append_text`
`new-document` props:
  folderId(DROPDOWN)
`new_document_in_folder` props:
  parentFolder(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if folders from Team Drives should be included in
`create_document` props:
  title★(SHORT_TEXT)
  body★(LONG_TEXT)
`create_document_based_on_template` props:
  template★(SHORT_TEXT) //The ID of the file to replace the values
  values★(OBJECT) //Dont include the placeholder format "[[]]" or "{{}}", only t
  images★(OBJECT) //Key: Image ID (get it manually from the Read File Action), V
  placeholder_format★(STATIC_DROPDOWN)='[[]]' ["Curly Braces {{}}"|"Square Brackets [[]]"] //Choose the format of placeholders in your template
`create_document_from_template` props:
  templateId★(SHORT_TEXT) //The ID of the template document to copy from
  newDocumentTitle★(SHORT_TEXT) //The title for the new document
  folderId(SHORT_TEXT) //The ID of the folder where to create the new document. Leave
  replacePlaceholders(CHECKBOX)=false //Enable to replace placeholders in the template with provided
  placeholders(OBJECT) //Key-value pairs to replace placeholders. Keys should be plac
  placeholderFormat(STATIC_DROPDOWN)='[[]]' ["Square Brackets [[]]"|"Curly Braces {{}}"|"Double Curly Braces {{{}}}"] //Choose the format of placeholders in your template
  replaceImages(CHECKBOX)=false //Enable to replace images in the template with new URLs
  images(OBJECT) //Key: Image ID (get it from Read Document Action), Value: New
`create_document_from_text` props:
  title★(SHORT_TEXT) //The title of the new document
  content★(LONG_TEXT) //The text content to add to the document
  folderId(SHORT_TEXT) //The ID of the folder where to create the document. Leave emp
  formatAsMarkdown(CHECKBOX)=false //Convert markdown formatting to Google Docs formatting (heade
  includeTimestamp(CHECKBOX)=false //Add a timestamp at the beginning of the document
`upload_document` props:
  file★(LONG_TEXT) //Enter a file path (Windows: C:/Users/username/file.pdf, Linu
  title(SHORT_TEXT) //Custom title for the uploaded document. If not provided, the
  folderId(SHORT_TEXT) //The ID of the folder where to store the uploaded document. L
  convertToGoogleDocs(CHECKBOX)=true //Convert the uploaded file to Google Docs format. If disabled
  ocrLanguage(STATIC_DROPDOWN)='en' ["English"|"Spanish"|"French"|"German"|"Italian"|"Portuguese"|"Russian"|"Chinese (Simplified)"|"Japanese"|"Korean"] //Language for OCR processing when converting PDFs with images
`read_document` props:
  documentId★(SHORT_TEXT) //The ID of the document to read
`google-docs-find-document` props:
  name★(SHORT_TEXT)
  folderId(DROPDOWN)
  createIfNotFound(CHECKBOX)=false
  newDocumentProps(DYNAMIC)
`api_request` props:
  method★(STATIC_DROPDOWN)='GET' ["GET"|"POST"|"PUT"|"PATCH"|"DELETE"] //The HTTP method to use for the request
  endpoint★(SHORT_TEXT)='/documents' //The API endpoint (e.g., /documents, /documents/{documentId},
  documentId(SHORT_TEXT) //Document ID to use in the endpoint. Will replace {documentId
  queryParams(OBJECT) //Query parameters to include in the request URL
  headers(OBJECT) //Additional headers to include in the request
  body(JSON) //JSON body for POST, PUT, PATCH requests
  includeAuth(CHECKBOX)=true //Include OAuth2 authentication headers (recommended)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)
`append_text` props:
  text★(LONG_TEXT) //The text to append to the document
  documentId★(SHORT_TEXT) //The ID of the document to append text to

### google-calendar  v2.0.3 | OAuth2
*Get organized and stay on schedule*
**Triggers:** `event_calendar` `new_calendar` `event_ended` `event_started` `new_event` `updated_event` `new_event_matching_search`
**Actions:** `google-calendar-add-attendees` `create_google_calendar` `create_quick_event` `create_google_calendar_event` `create_detailed_google_calendar_event` `retrieve_event_by_id` `find_event` `find_multiple_events` `find_or_create_event` `google_calendar_get_events` `update_event` `delete_event` `custom_api_call`
`event_calendar` props:
  calendar_id★(DROPDOWN)
  expandRecurringEvent★(CHECKBOX)=false //If true, the trigger will activate for every occurrence of a
`event_ended` props:
  calendarId★(SHORT_TEXT)='primary' //The ID of the calendar to watch for ended events. Use "prima
`event_started` props:
  calendarId★(SHORT_TEXT)='primary' //The calendar to watch for events. Use "primary" for your mai
  timeBefore★(NUMBER)=15 //How much time before the event starts to trigger.
  timeUnit★(STATIC_DROPDOWN)='minutes' ["Minutes"|"Hours"|"Days"] //The unit of time for the "Time Before" setting.
  searchTerm(SHORT_TEXT) //Optional search term to filter events by title or descriptio
`new_event` props:
  calendarId★(SHORT_TEXT)='primary' //The calendar to watch for new events. Use "primary" for your
  timeBefore★(NUMBER)=15 //How much time before the event starts to trigger.
  timeUnit★(STATIC_DROPDOWN)='minutes' ["Minutes"|"Hours"|"Days"] //The unit of time for the "Time Before" setting.
  searchTerm(SHORT_TEXT) //Optional search term to filter events by title or descriptio
`updated_event` props:
  calendarId(SHORT_TEXT) //Leave blank for primary calendar, or specify another calenda
`new_event_matching_search` props:
  calendarId★(SHORT_TEXT)='primary' //The ID of the calendar to watch (usually "primary" for main 
  search★(SHORT_TEXT) //Text to search for in event summary or description.
`google-calendar-add-attendees` props:
  calendar_id★(DROPDOWN)
  event_id★(DROPDOWN)
  attendees★(ARRAY) //Emails of the attendees (guests)
`create_google_calendar` props:
  title★(SHORT_TEXT) //The name/title of the calendar
  description(LONG_TEXT) //Description of the calendar
  location(SHORT_TEXT) //Geographic location of the calendar (e.g., "San Francisco, C
  timezone(SHORT_TEXT)='Asia/Kolkata' //Timezone for the calendar (e.g., "America/New_York", "Europe
  colorId(DROPDOWN)
  default_reminders_enabled(CHECKBOX)=true //Whether to set default reminders for events in this calendar
  default_reminder_popup_minutes(NUMBER)=10 //Default minutes before event to show popup reminder
  default_reminder_email_minutes(NUMBER)=1440 //Default minutes before event to send email reminder
  notification_email_enabled(CHECKBOX)=true //Whether to send email notifications for calendar events
  notification_popup_enabled(CHECKBOX)=true //Whether to show popup notifications for calendar events
  conference_properties_enabled(CHECKBOX)=true //Whether to allow conference creation in events
  conference_google_meet(CHECKBOX)=true //Whether to allow Google Meet conferences
  conference_addon(CHECKBOX)=false //Whether to allow add-on conference solutions
  selected(CHECKBOX)=true //Whether this calendar should be selected by default in the U
  hidden(CHECKBOX)=false //Whether this calendar should be hidden from the UI
  access_role(STATIC_DROPDOWN)='owner' ["Owner"|"Writer"|"Reader"|"Free Busy Reader"] //Default access role for the calendar
`create_quick_event` props:
  calendar_id★(DROPDOWN)
  text★(LONG_TEXT) //The text describing the event to be created
  send_updates(STATIC_DROPDOWN) ["All"|"External Only"|"none"] //Guests who should receive notifications about the creation o
`create_google_calendar_event` props:
  calendar_id★(DROPDOWN)
  title★(SHORT_TEXT)
  start_date_time★(DATE_TIME)
  end_date_time(DATE_TIME) //By default it'll be 30 min post start time
  location(SHORT_TEXT)
  description(LONG_TEXT) //Description of the event. You can use HTML tags here.
  colorId(DROPDOWN)
  attendees(ARRAY) //Emails of the attendees (guests)
  guests_can_modify(CHECKBOX)=false
  guests_can_invite_others(CHECKBOX)=false
  guests_can_see_other_guests(CHECKBOX)=false
  timezone(SHORT_TEXT)='Asia/Kolkata' //Timezone for the event (e.g., "America/New_York", "Europe/Lo
  send_notifications★(STATIC_DROPDOWN)='all' ["Yes, to everyone"|"To non-Google Calendar guests only"|"To no one"]
`create_detailed_google_calendar_event` props:
  calendar_id★(DROPDOWN)
  title★(SHORT_TEXT) //The title/summary of the event
  description(LONG_TEXT) //Description of the event. You can use HTML tags here.
  location(SHORT_TEXT) //Location of the event
  start_date_time★(DATE_TIME) //When the event starts
  end_date_time(DATE_TIME) //When the event ends. If not specified, will be 30 minutes af
  timezone(SHORT_TEXT)='Asia/Kolkata' //Timezone for the event (e.g., "America/New_York", "Europe/Lo
  all_day(CHECKBOX)=false //Whether this is an all-day event
  colorId(DROPDOWN)
  attendees(ARRAY) //Email addresses of attendees
  attendees_optional(ARRAY) //Email addresses of optional attendees
  guests_can_modify(CHECKBOX)=false //Whether guests can modify the event
  guests_can_invite_others(CHECKBOX)=false //Whether guests can invite other people
  guests_can_see_other_guests(CHECKBOX)=true //Whether guests can see other guests
  anyone_can_add_self(CHECKBOX)=false //Whether anyone can add themselves to the event
  send_notifications★(STATIC_DROPDOWN)='all' ["Yes, to everyone"|"To non-Google Calendar guests only"|"To no one"] //Who should receive notifications about this event
  visibility(STATIC_DROPDOWN)='default' ["Default"|"Public"|"Private"] //Who can see this event
  transparency(STATIC_DROPDOWN)='opaque' ["Busy (blocks time)"|"Free (doesn't block time)"] //Whether the event blocks time on the calendar
  recurrence_enabled(CHECKBOX)=false //Whether this event should repeat
  recurrence_frequency(STATIC_DROPDOWN)='DAILY' ["Daily"|"Weekly"|"Monthly"|"Yearly"] //How often the event should repeat
  recurrence_interval(NUMBER)=1 //Interval between recurrences (e.g., every 2 weeks)
  recurrence_count(NUMBER) //How many times the event should repeat (leave empty for no e
  recurrence_until(DATE_TIME) //Date until which the event should repeat (leave empty for no
  recurrence_by_day(ARRAY) //Days of the week for weekly recurrence (e.g., ["MO", "WE", "
  reminders_use_default(CHECKBOX)=true //Whether to use the calendar's default reminders
  reminder_popup_minutes(NUMBER)=10 //Minutes before event to show popup reminder
  reminder_email_minutes(NUMBER)=1440 //Minutes before event to send email reminder
  conference_enabled(CHECKBOX)=false //Whether to add video conference to the event
  conference_type(STATIC_DROPDOWN)='hangoutsMeet' ["Google Meet"|"Add Conferencing"] //Type of video conference to create
  extended_properties_private(JSON) //Private custom properties for the event (JSON object)
  extended_properties_shared(JSON) //Shared custom properties for the event (JSON object)
  source_url(SHORT_TEXT) //URL of the source of this event
  source_title(SHORT_TEXT) //Title of the source of this event
`retrieve_event_by_id` props:
  calendar_id★(DROPDOWN)
  event_id★(SHORT_TEXT) //The unique identifier of the event to retrieve
  timezone(SHORT_TEXT) //Timezone for the event (e.g., "America/New_York", "Europe/Lo
  always_include_email(CHECKBOX)=false //Whether to always include a value in the email field for the
  max_attendees(NUMBER)=100 //Maximum number of attendees to include in the response. If t
  single_events(CHECKBOX)=false //Whether to expand recurring events into instances and only r
  show_deleted(CHECKBOX)=false //Whether to include deleted events in the result
  show_hidden_invitations(CHECKBOX)=false //Whether to include hidden invitations in the result
`find_event` props:
  calendar_id★(DROPDOWN)
  search_text(SHORT_TEXT) //Search for events containing this text in title, description
  start_date(DATE_TIME) //Find events starting from this date/time
  end_date(DATE_TIME) //Find events ending before this date/time
  event_types(STATIC_MULTI_SELECT_DROPDOWN) ["Default"|"Out Of Office"|"Focus Time"|"Working Location"] //Filter by event types
  attendee_email(SHORT_TEXT) //Find events where this person is an attendee
  organizer_email(SHORT_TEXT) //Find events organized by this person
  location_contains(SHORT_TEXT) //Find events with location containing this text
  event_status(STATIC_DROPDOWN) ["Any Status"|"Confirmed"|"Tentative"|"Cancelled"] //Filter by event status
  single_events(CHECKBOX)=false //Whether to expand recurring events into instances
  show_deleted(CHECKBOX)=false //Whether to include deleted events in results
  show_hidden_invitations(CHECKBOX)=false //Whether to include hidden invitations
  timezone(SHORT_TEXT)='Asia/Kolkata' //Timezone for date/time formatting (e.g., "America/New_York")
  max_results(NUMBER)=100 //Maximum number of events to return (1-2500)
  order_by(STATIC_DROPDOWN)='startTime' ["Start Time"|"Updated Time"] //How to order the results. Note: "Start Time" and "Updated Ti
  page_token(SHORT_TEXT) //Token for pagination (for getting next page of results)
`find_multiple_events` props:
  calendar_ids(ARRAY) //List of calendar IDs to search in (leave empty to search all
  search_criteria(JSON) //JSON object with search criteria (e.g., {"search_text": "Mee
  search_scenarios(ARRAY) //Array of different search scenarios to execute. Each scenari
  date_range_type(STATIC_DROPDOWN)='custom' //Type of date range to use for search
  event_type_filters(STATIC_MULTI_SELECT_DROPDOWN) ["All Types"|"Default"|"Out Of Office"|"Focus Time"|"Working Location"] //Filter events by type
  status_filters(STATIC_MULTI_SELECT_DROPDOWN) ["All Statuses"|"Confirmed"|"Tentative"|"Cancelled"] //Filter events by status
  attendee_emails(ARRAY) //Array of attendee emails to search for
  organizer_emails(ARRAY) //Array of organizer emails to search for
  location_keywords(ARRAY) //Array of location keywords to search for
  expand_recurring(CHECKBOX)=false //Whether to expand recurring events into instances
  include_deleted(CHECKBOX)=false //Whether to include deleted events in results
  include_hidden(CHECKBOX)=false //Whether to include hidden invitations
  max_results_per_search(NUMBER)=100 //Maximum number of events to return per search (1-2500)
  timezone(SHORT_TEXT)='Asia/Kolkata' //Timezone for date/time formatting (e.g., "America/New_York")
  group_by_calendar(CHECKBOX)=true //Whether to group results by calendar
  include_summary(CHECKBOX)=true //Whether to include summary statistics in results
`find_or_create_event` props:
  calendar_id(SHORT_TEXT)='primary' //Calendar ID where to search/create the event (default: prima
  search_criteria★(JSON) //JSON object with criteria to search for existing events. E.g
  search_time_window(NUMBER)=30 //Time window in minutes to search around the event start time
  exact_match_required(CHECKBOX)=false //Whether to require exact matches for all search criteria (if
  title★(SHORT_TEXT) //Title/summary of the event to create (if not found)
  event_description(LONG_TEXT) //Description of the event to create (if not found)
  event_location(SHORT_TEXT) //Location of the event to create (if not found)
  start_date_time★(DATE_TIME) //Start date and time of the event to create (if not found)
  end_date_time★(DATE_TIME) //End date and time of the event to create (if not found)
  timezone(SHORT_TEXT)='Asia/Kolkata' //Timezone for the event (e.g., "America/New_York")
  attendee_emails(ARRAY) //Array of attendee email addresses
  optional_attendee_emails(ARRAY) //Array of optional attendee email addresses
  event_visibility(STATIC_DROPDOWN)='default' ["Default"|"Public"|"Private"] //Visibility of the event
  event_transparency(STATIC_DROPDOWN)='opaque' ["Busy (Opaque)"|"Free (Transparent)"] //Whether the event blocks time on the calendar
  guests_can_modify(CHECKBOX)=false //Whether guests can modify the event
  guests_can_invite_others(CHECKBOX)=true //Whether guests can invite other people
  guests_can_see_other_guests(CHECKBOX)=true //Whether guests can see other guests
  anyone_can_add_self(CHECKBOX)=false //Whether anyone can add themselves to the event
  add_conference(CHECKBOX)=false //Whether to add a conference (Google Meet) to the event
  conference_type(STATIC_DROPDOWN)='hangoutsMeet' ["Google Meet"|"Add-on Conference"] //Type of conference to add
  use_default_reminders(CHECKBOX)=true //Whether to use default calendar reminders
  custom_reminders(JSON) //JSON array of custom reminders. Each reminder should have "m
  private_properties(JSON) //JSON object with private extended properties (key-value pair
  shared_properties(JSON) //JSON object with shared extended properties (key-value pairs
  source_title(SHORT_TEXT) //Title of the source that created this event
  source_url(SHORT_TEXT) //URL of the source that created this event
  update_existing(CHECKBOX)=false //Whether to update existing event if found (instead of just r
  return_detailed_info(CHECKBOX)=true //Whether to return detailed information about the action take
`google_calendar_get_events` props:
  calendar_id★(DROPDOWN)
  event_types★(STATIC_MULTI_SELECT_DROPDOWN) ["Default"|"Out Of Office"|"Focus Time"|"Working Location"] //Select event types
  search(SHORT_TEXT)
  start_date(DATE_TIME)
  end_date(DATE_TIME)
  singleEvents★(CHECKBOX)=false //Whether to expand recurring events into instances and only r
`update_event` props:
  calendar_id★(DROPDOWN)
  event_id★(DROPDOWN)
  title(SHORT_TEXT) //The title of the event
  start_date_time(DATE_TIME) //The start date and time of the event
  end_date_time(DATE_TIME) //The end date and time of the event
  timezone(SHORT_TEXT)='Asia/Kolkata' //The timezone of the event
  location(SHORT_TEXT)
  description(LONG_TEXT) //Description of the event. You can use HTML tags here.
  colorId(DROPDOWN)
  attendees(ARRAY) //Emails of the attendees (guests)
  guests_can_modify(CHECKBOX)=false
  guests_can_invite_others(CHECKBOX)=false
  guests_can_see_other_guests(CHECKBOX)=false
`delete_event` props:
  calendar_id★(DROPDOWN)
  event_id★(DROPDOWN)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-contacts  v2.0.0 | OAuth2
*Stay connected and organized*
**Triggers:** `new_contact_only` `new_group` `new_or_updated_contact`
**Actions:** `create_contact` `update_contact` `search_contact` `add_contact_to_group` `remove_contact_from_group` `create_group` `upload_contact_photo` `custom_api_call`
`create_contact` props:
  firstName★(SHORT_TEXT) //The first name of the contact
  middleName(SHORT_TEXT) //The middle name of the contact
  lastName★(SHORT_TEXT) //The last name of the contact
  jobTitle(SHORT_TEXT) //The job title of the contact
  company(SHORT_TEXT) //The company of the contact
  email(SHORT_TEXT) //The email address of the contact
  phoneNumber(SHORT_TEXT) //The phone number of the contact
`update_contact` props:
  resourceName★(SHORT_TEXT) //The resource name for the person, assigned by the server. An
  etag★(SHORT_TEXT) //The `etag` ensures contact updates only apply if the contact
  updatePersonFields★(STATIC_MULTI_SELECT_DROPDOWN) ["Names"|"Email"|"Phone Number"|"Job Title / Company"] //A field mask to restrict which fields on the person are upda
  firstName(SHORT_TEXT) //The first name of the contact
  middleName(SHORT_TEXT) //The middle name of the contact
  lastName(SHORT_TEXT) //The last name of the contact
  jobTitle(SHORT_TEXT) //The job title of the contact
  company(SHORT_TEXT) //The company of the contact
  email(SHORT_TEXT) //The email address of the contact
  phoneNumber(SHORT_TEXT) //The phone number of the contact
`search_contact` props:
  query★(SHORT_TEXT) //The plain-text query for the request.The query is used to ma
  readMask★(STATIC_MULTI_SELECT_DROPDOWN) //A field mask to restrict which fields on each person are ret
  pageSize(NUMBER) //The number of results to return. Maximum 30.
`add_contact_to_group` props:
  contactResourceName★(SHORT_TEXT) //The resource name of the contact (e.g., people/c123456789)
  groupResourceName★(SHORT_TEXT) //The resource name of the group (e.g., contactGroups/g1234567
`remove_contact_from_group` props:
  contactResourceName★(SHORT_TEXT) //The resource name of the contact (e.g., people/c123456789)
  groupResourceName★(SHORT_TEXT) //The resource name of the group (e.g., contactGroups/g1234567
`create_group` props:
  groupName★(SHORT_TEXT) //The name of the contact group to create
  description(LONG_TEXT) //Optional description for the contact group
`upload_contact_photo` props:
  contactResourceName★(SHORT_TEXT) //The resource name of the contact (e.g., people/c123456789)
  photoUrl(SHORT_TEXT) //URL of the photo to upload (must be a complete HTTP/HTTPS UR
  photoFile(FILE) //Photo file to upload (preferred method for reliability)
  photoDataUrl(SHORT_TEXT) //Base64 encoded photo data URL (e.g., data:image/jpeg;base64,
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-forms  v2.0.1 | OAuth2
*Receive form responses from Google Forms*
**Triggers:** `new_response` `new_or_updated_response`
**Actions:** `list_forms` `get_form` `get_form_responses` `get_form_response` `custom_api_call`
`new_response` props:
  form_id★(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if forms from Team Drives should be included in t
`new_or_updated_response` props:
  form_id★(DROPDOWN)
  include_team_drives(CHECKBOX)=false //Determines if forms from Team Drives should be included in t
  trigger_question(DROPDOWN) //Only trigger when a specific question has a certain answer. 
  include_response_content(CHECKBOX)=false //Include the full response content in the output. This will i
`list_forms` props:
  include_team_drives(CHECKBOX)=false //Include forms from shared Team Drives in the results.
  search_query(SHORT_TEXT) //Filter forms by name. Leave empty to list all forms.
  max_results(NUMBER)=20 //Maximum number of forms to return. Defaults to 20.
`get_form` props:
  include_team_drives(CHECKBOX)=false //Determines if forms from Team Drives should be included in t
  form_id★(DROPDOWN)
`get_form_responses` props:
  include_team_drives(CHECKBOX)=false //Determines if forms from Team Drives should be included in t
  form_id★(DROPDOWN)
  after_date(SHORT_TEXT) //Only return responses submitted after this date/time. Use IS
  max_results(NUMBER)=50 //Maximum number of responses to return. Defaults to 50.
`get_form_response` props:
  include_team_drives(CHECKBOX)=false //Determines if forms from Team Drives should be included in t
  form_id★(DROPDOWN)
  response_id★(SHORT_TEXT) //The unique ID of the response to retrieve. This is returned 
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-slides  v2.0.4 | OAuth2
*Create and manage Google Slides presentations. Search and find presentations, generate presentations*
**Actions:** `search_presentations` `get_presentation` `create_presentation` `generate_from_template` `add_slide` `update_text_in_presentation` `refresh_sheets_charts` `custom_api_call`
`search_presentations` props:
  query(SHORT_TEXT) //Search by presentation name or keyword. Partial matches are 
  limit(NUMBER)=10 //Maximum number of presentations to return (default: 10).
`get_presentation` props:
  presentation_id(SHORT_TEXT) //The unique ID of the presentation (found in the URL: docs.go
  presentation_name(SHORT_TEXT) //Search for the presentation by name or partial name (e.g., "
`create_presentation` props:
  title(SHORT_TEXT)='Untitled Presentation' //Title for the new presentation (e.g., "Q4 Sales Report 2024"
`generate_from_template` props:
  template_presentation_id(SHORT_TEXT) //The unique ID of the template (from URL: docs.google.com/pre
  template_name(SHORT_TEXT) //Search for the template presentation by name (e.g., "Sales T
  new_title(SHORT_TEXT) //The title for the newly created presentation (e.g., "Q4 Sale
  placeholder_format★(STATIC_DROPDOWN)='{{}}' ["Curly Braces {{}}"|"Square Brackets [[]]"] //The format of placeholders used in the template. Use {{}} fo
  replacements(LONG_TEXT) //A JSON object mapping placeholder names to their replacement
  table_data(DYNAMIC)
`add_slide` props:
  presentation_id(SHORT_TEXT) //The unique ID of the presentation (from URL: docs.google.com
  presentation_name(SHORT_TEXT) //Search for the presentation by name. Used when Presentation 
  layout(STATIC_DROPDOWN)='BLANK' //The layout template for the new slide (default: Blank).
  insertion_index(NUMBER) //Position to insert the slide (0-based index). Leave empty to
  slide_title(SHORT_TEXT) //Optional title text to set on the slide (only works with lay
  slide_body(LONG_TEXT) //Optional body text to set on the slide (only works with layo
`update_text_in_presentation` props:
  presentation_id(SHORT_TEXT) //The unique ID of the presentation (from URL: docs.google.com
  presentation_name(SHORT_TEXT) //Name of the presentation to search for. Used when Presentati
  find_text★(SHORT_TEXT) //The exact text string to find and replace. Examples: "{{comp
  replace_text★(SHORT_TEXT) //The new text to put in place of the found text. Examples: "A
  match_case(CHECKBOX)=false //When enabled, only replaces exact case matches. Default: fal
`refresh_sheets_charts` props:
  presentation_id(SHORT_TEXT) //The unique ID of the presentation (found in the URL: docs.go
  presentation_name(SHORT_TEXT) //Search for the presentation by name or partial name. Used wh
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-meet  v2.0.1 | OAuth2
*Schedule and manage Google Meet video meetings*
**Actions:** `schedule_google_meet_meeting` `custom_api_call`
`schedule_google_meet_meeting` props:
  calendar_id★(DROPDOWN)
  title★(SHORT_TEXT) //The title/summary of the meeting
  description(LONG_TEXT) //Description of the meeting. You can use HTML tags here.
  start_date★(SHORT_TEXT) //Start date of the meeting. Accepts: MM/DD/YYYY (e.g. 03/03/2
  start_time(SHORT_TEXT) //Start time of the meeting (e.g. "2:00 PM", "14:00"). Leave e
  end_date(SHORT_TEXT) //End date of the meeting. Accepts: MM/DD/YYYY, YYYY-MM-DD, or
  end_time(SHORT_TEXT) //End time of the meeting (e.g. "3:00 PM", "15:00"). If empty,
  timezone(SHORT_TEXT)='UTC' //Timezone for the meeting (e.g., "America/New_York", "Europe/
  attendees(ARRAY) //Email addresses of meeting attendees
  send_notifications★(STATIC_DROPDOWN)='all' ["Yes, to everyone"|"To non-Google Calendar guests only"|"To no one"] //Who should receive notifications about this meeting
  guests_can_modify(CHECKBOX)=false //Whether guests can modify the event
  guests_can_invite_others(CHECKBOX)=false //Whether guests can invite other people
  guests_can_see_other_guests(CHECKBOX)=true //Whether guests can see other guests
  reminders_use_default(CHECKBOX)=true //Whether to use the calendar's default reminders
  reminder_minutes(NUMBER)=10 //Minutes before meeting to show popup reminder (only when def
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-tasks  v2.0.0 | OAuth2
*Task list management application*
**Triggers:** `new_task`
**Actions:** `add_task` `custom_api_call`
`new_task` props:
  tasks_list★(DROPDOWN)
`add_task` props:
  tasks_list★(DROPDOWN)
  title★(SHORT_TEXT)
  notes(LONG_TEXT)
  due(DATE_TIME) //Due date of the task (YYYY-MM-DD)
  completed(CHECKBOX) //Mark task as completed
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-my-business  v2.0.0 | OAuth2
*Manage your business on Google*
**Triggers:** `new_review`
**Actions:** `create-reply` `custom_api_call`
`new_review` props:
  account★(DROPDOWN)
  location★(DROPDOWN)
`create-reply` props:
  reviewName★(SHORT_TEXT) //You can find the review name from new review trigger
  comment★(LONG_TEXT) //Comment to be added to the review
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### google-search-console  v2.0.1 | OAuth2
*Monitor and optimize your website's presence in Google Search results. Analyze search analytics, man*
**Actions:** `search_analytics` `list_sitemaps` `submit_sitemap` `list_sites` `add_site` `delete_site` `urlInspection` `custom_api_call`
`search_analytics` props:
  siteUrl★(DROPDOWN)
  startDate★(DATE_TIME)='2026-03-03' //The start date of the date range to query (in YYYY-MM-DD for
  endDate★(DATE_TIME)='2026-03-03' //The end date of the date range to query (in YYYY-MM-DD forma
  dimensions(ARRAY) //The dimensions to group results by. For example: ["query", "
  filters(ARRAY) //Optional filters to apply to the data. Filters can be used t
  aggregationType(SHORT_TEXT) //How data is aggregated. Options include "auto", "byPage", "b
  rowLimit(NUMBER) //The maximum number of rows to return.
  startRow(NUMBER) //The first row to return. Use this parameter to paginate resu
`list_sitemaps` props:
  siteUrl★(DROPDOWN)
`submit_sitemap` props:
  siteUrl★(DROPDOWN)
  feedpath★(SHORT_TEXT)
`add_site` props:
  siteUrl★(SHORT_TEXT)
`delete_site` props:
  siteUrl★(DROPDOWN)
`urlInspection` props:
  siteUrl★(DROPDOWN)
  url★(SHORT_TEXT)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### googlechat  v2.0.0 | OAuth2
*Google Chat is a messaging app that allows you to send and receive messages, create spaces, and more*
**Triggers:** `newMessage` `newMention`
**Actions:** `sendAMessage` `getDirectMessageDetails` `addASpaceMember` `getMessageDetails` `searchMessages` `findMember`
`newMessage` props:
  projectId★(DROPDOWN) //Select a Google Cloud Project
  spaceId(DROPDOWN) //Select a Space, leave empty for all spaces
`newMention` props:
  projectId★(DROPDOWN) //Select a Google Cloud Project
  spaceId(DROPDOWN) //Select a Space, leave empty for all spaces
  spaceMemberId(DROPDOWN) //Select a space member, leave empty for all members
`sendAMessage` props:
  spaceId★(DROPDOWN) //Select a Space
  text★(LONG_TEXT) //The message content to send. Supports basic formatting like 
  thread(DROPDOWN) //Select a thread to reply to, leave empty for new thread
  messageReplyOption(STATIC_DROPDOWN) ["Reply or start new thread"|"Reply only (fail if thread not found)"] //How to handle replies when thread ID is provided.
  customMessageId(SHORT_TEXT) //Optional unique ID for this message (auto-generated if empty
  isPrivate(CHECKBOX) //Send this message privately to a specific user. Requires app
  privateMessageViewer(DROPDOWN) //Select the user who can view this private message.
`getDirectMessageDetails` props:
  directMessageId★(DROPDOWN) //Select a Direct Message
`addASpaceMember` props:
  spaceId★(DROPDOWN) //Select a Space
  personId★(DROPDOWN) //Select a person
`getMessageDetails` props:
  name★(SHORT_TEXT) //The full resource name of the message. Format: spaces/{space
`searchMessages` props:
  spaceId★(DROPDOWN) //Select a Space
  keyword★(SHORT_TEXT) //Search for messages containing this text
  limit(NUMBER)=50 //Maximum number of messages to return
`findMember` props:
  spaceId★(DROPDOWN) //Select a Space
  email★(SHORT_TEXT) //The email address of the member to find

## ★ MICROSOFT 365

### microsoft-teams  v2.0.0 | OAuth2
*Communicate and collaborate with your team using Microsoft Teams. Send messages to channels and chat*
**Triggers:** `new-channel-message` `new-channel` `new-chat` `new-chat-message`
**Actions:** `microsoft_teams_create_channel` `microsoft_teams_send_channel_message` `microsoft_teams_send_chat_message` `microsoft_teams_reply_to_channel_message` `microsoft_teams_create_chat_and_send_message` `microsoft_teams_create_private_channel` `microsoft_teams_get_chat_message` `microsoft_teams_get_channel_message` `microsoft_teams_find_channel` `microsoft_teams_find_team_member` `custom_api_call`
`new-channel-message` props:
  teamId★(DROPDOWN)
  channelId★(DROPDOWN)
`new-channel` props:
  teamId★(DROPDOWN)
`new-chat-message` props:
  chatId★(DROPDOWN)
`microsoft_teams_create_channel` props:
  teamId★(DROPDOWN)
  channelDisplayName★(SHORT_TEXT)
  channelDescription(LONG_TEXT)
`microsoft_teams_send_channel_message` props:
  teamId★(DROPDOWN)
  channelId★(DROPDOWN)
  contentType★(STATIC_DROPDOWN)='text' ["Text"|"HTML"]
  content★(LONG_TEXT)
`microsoft_teams_send_chat_message` props:
  chatId★(DROPDOWN)
  contentType★(STATIC_DROPDOWN)='text' ["Text"|"HTML"]
  content★(LONG_TEXT)
`microsoft_teams_reply_to_channel_message` props:
  teamId★(DROPDOWN)
  channelId★(DROPDOWN)
  messageId★(SHORT_TEXT) //ID of the parent message to reply to.
  contentType★(STATIC_DROPDOWN)='text' ["Text"|"HTML"]
  content★(LONG_TEXT)
`microsoft_teams_create_chat_and_send_message` props:
  teamId★(DROPDOWN)
  members★(MULTI_SELECT_DROPDOWN)
  contentType★(STATIC_DROPDOWN)='text' ["Text"|"HTML"]
  content★(LONG_TEXT)
`microsoft_teams_create_private_channel` props:
  teamId★(DROPDOWN)
  channelDisplayName★(SHORT_TEXT)
  channelDescription(LONG_TEXT)
`microsoft_teams_get_chat_message` props:
  chatId★(DROPDOWN)
  messageId★(SHORT_TEXT) //The ID of the message to retrieve.
`microsoft_teams_get_channel_message` props:
  teamId★(DROPDOWN)
  channelId★(DROPDOWN)
  messageId★(SHORT_TEXT) //The ID of the channel message to retrieve.
  replyId(SHORT_TEXT) //Provide to fetch a specific reply under the message.
`microsoft_teams_find_channel` props:
  teamId★(DROPDOWN)
  channelName★(SHORT_TEXT)
`microsoft_teams_find_team_member` props:
  teamId★(DROPDOWN)
  searchBy★(STATIC_DROPDOWN)='email' ["Email"|"Name"]
  searchValue★(SHORT_TEXT) //Email address or name to search for.
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### microsoft-outlook  v2.0.2 | OAuth2
*Manage your emails and attachments with Microsoft Outlook. Send emails, reply to messages, manage fo*
**Triggers:** `newEmail` `newEmailInFolder` `newAttachment` `newEmailMatchingSearch` `newEmailInSharedMailbox` `newFlaggedEmail`
**Actions:** `send-email` `downloadAttachment` `reply-email` `createDraftEmail` `addLabelToEmail` `removeLabelFromEmail` `moveEmailToFolder` `sendDraftEmail` `forwardEmail` `findEmail` `delete_email` `copy_email` `flag_email` `mark_email_read_unread` `set_email_importance` `create_folder` `custom_api_call`
`newEmailInFolder` props:
  folderId★(DROPDOWN)
`newAttachment` props:
  folderId(DROPDOWN) //Monitor attachments in a specific folder. Leave empty to mon
`newEmailMatchingSearch` props:
  searchQuery★(SHORT_TEXT) //Search text to match in subject, body, or sender (same synta
`newEmailInSharedMailbox` props:
  mailboxUserPrincipalName★(SHORT_TEXT) //User principal name (email address) of the shared mailbox (f
`send-email` props:
  recipients★(ARRAY)
  ccRecipients(ARRAY)
  bccRecipients(ARRAY)
  subject★(SHORT_TEXT)
  bodyFormat★(STATIC_DROPDOWN)='text' ["HTML"|"Text"]
  body★(LONG_TEXT)
  attachments(ARRAY)
`downloadAttachment` props:
  messageId★(SHORT_TEXT) //The ID of the email message containing the attachment.
`reply-email` props:
  messageId★(DROPDOWN) //Select the email message to reply to.
  bodyFormat★(STATIC_DROPDOWN)='text' ["HTML"|"Text"]
  replyBody★(LONG_TEXT)
  ccRecipients(ARRAY)
  bccRecipients(ARRAY)
  attachments(ARRAY)
  draft★(CHECKBOX)=false //If enabled, creates draft without sending.
`createDraftEmail` props:
  recipients★(ARRAY)
  ccRecipients(ARRAY)
  bccRecipients(ARRAY)
  subject★(SHORT_TEXT)
  bodyFormat★(STATIC_DROPDOWN)='text' ["HTML"|"Text"]
  body★(LONG_TEXT)
  attachments(ARRAY)
`addLabelToEmail` props:
  messageId★(DROPDOWN) //Select the email message to add the label to.
  categories★(ARRAY) //Categories to add to the email.
`removeLabelFromEmail` props:
  messageId★(DROPDOWN) //Select the email message to remove the label from.
  categories★(ARRAY) //Categories to remove from the email.
`moveEmailToFolder` props:
  messageId★(DROPDOWN) //Select the email message to move.
  destinationFolderId★(DROPDOWN) //The folder to move the email to.
`sendDraftEmail` props:
  messageId★(DROPDOWN) //Select the draft email message to send.
`forwardEmail` props:
  messageId★(DROPDOWN) //Select the email message to forward.
  recipients★(ARRAY)
  comment(LONG_TEXT) //Optional comment to include with the forwarded message.
`findEmail` props:
  searchQuery★(SHORT_TEXT) //Search terms to find emails (e.g., "from:john@example.com", 
  folderId(DROPDOWN) //Search in a specific folder. Leave empty to search all folde
  top(NUMBER)=25 //Maximum number of results to return (1-1000).
`delete_email` props:
  messageId★(DROPDOWN) //Select the email message to delete.
`copy_email` props:
  messageId★(DROPDOWN) //Select the email message to copy.
  destinationFolderId★(DROPDOWN) //Folder where the copied email will be placed.
`flag_email` props:
  messageId★(DROPDOWN) //Select the email message to flag or unflag.
  flagStatus★(STATIC_DROPDOWN)='flagged' ["Flagged"|"Completed"|"Not Flagged"] //Choose whether to flag, complete, or clear the flag.
`mark_email_read_unread` props:
  messageId★(DROPDOWN) //Select the email message to update.
  isRead★(STATIC_DROPDOWN)='true' ["Read"|"Unread"]
`set_email_importance` props:
  messageId★(DROPDOWN) //Select the email message to update.
  importance★(STATIC_DROPDOWN)='normal' ["Low"|"Normal"|"High"]
`create_folder` props:
  displayName★(SHORT_TEXT)
  parentFolderId(SHORT_TEXT) //Optional. ID of the parent folder. Leave empty to create in 
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### microsoft-outlook-calendar  v2.0.2 | OAuth2
*Calendar software by Microsoft*
**Triggers:** `outlook_new_calendar_event` `outlook_updated_calendar_event`
**Actions:** `create_event` `delete_event` `list_events` `custom_api_call`
`create_event` props:
  calendarId★(DROPDOWN)
  title★(SHORT_TEXT)
  start★(DATE_TIME)
  end(DATE_TIME) //By default it'll be 30 min post start time
  timezone★(DROPDOWN)
  location(SHORT_TEXT)
`delete_event` props:
  calendarId★(DROPDOWN)
  eventId★(SHORT_TEXT)
`list_events` props:
  calendarId★(DROPDOWN)
  filter(LONG_TEXT) //Search query filter, see: https://learn.microsoft.com/en-us/
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### microsoft-onedrive  v2.0.2 | OAuth2
*Cloud storage by Microsoft*
**Triggers:** `new_file` `new_folder` `new_activity_trigger`
**Actions:** `create_root_folder` `create_child_folder` `create_text_file` `get_file_by_id` `find_file` `find_folder` `download_file` `list_files` `list_folders` `create_sharing_link` `new_activity` `delete_file` `delete_folder` `export_file` `move_file` `move_folder` `rename_file` `rename_folder` `remove_item_permission` `custom_api_call`
`new_file` props:
  parentFolder(DROPDOWN)
`new_folder` props:
  parentFolder(DROPDOWN)
`new_activity_trigger` props:
  itemId(SHORT_TEXT) //The ID of a specific file or folder to monitor. Leave empty 
`create_root_folder` props:
  folderName★(SHORT_TEXT) //The name of the folder to create
`create_child_folder` props:
  parentFolder(DROPDOWN)
  folderName★(SHORT_TEXT) //The name of the child folder to create
`create_text_file` props:
  fileName★(SHORT_TEXT) //The name of the file to create (e.g. notes.txt)
  content★(LONG_TEXT) //The text content of the file
  parentId(DROPDOWN)
`get_file_by_id` props:
  fileId★(SHORT_TEXT) //The ID of the file to retrieve
`find_file` props:
  fileName★(SHORT_TEXT) //The name (or part of the name) of the file to search for (e.
`find_folder` props:
  folderName★(SHORT_TEXT) //The name of the folder to search for
`download_file` props:
  fileId★(SHORT_TEXT) //The ID of the file to download
`list_files` props:
  parentFolder(DROPDOWN)
`list_folders` props:
  parentFolder(DROPDOWN)
`create_sharing_link` props:
  itemId★(SHORT_TEXT) //The ID of the file or folder to share
  type★(STATIC_DROPDOWN) ["View"|"Edit"|"Embed"] //The type of sharing link to create
  scope(STATIC_DROPDOWN) ["Anyone with the link"|"People in your organization"] //The scope of the sharing link
`new_activity` props:
  itemId(SHORT_TEXT) //The ID of the file or folder to get activities for. Leave em
`delete_file` props:
  fileId★(SHORT_TEXT) //The ID of the file to delete
`delete_folder` props:
  folderId(DROPDOWN)
`export_file` props:
  fileId★(SHORT_TEXT) //The ID of the Office file to export (Word, Excel, or PowerPo
  format★(STATIC_DROPDOWN) ["PDF"|"HTML"|"GLB (3D)"|"JPG"] //The format to export the file to
`move_file` props:
  fileId★(SHORT_TEXT) //The ID of the file to move
  destinationFolder(DROPDOWN)
`move_folder` props:
  folderId★(SHORT_TEXT) //The ID of the folder to move
  destinationFolder(DROPDOWN)
`rename_file` props:
  fileId★(SHORT_TEXT) //The ID of the file to rename
  newName★(SHORT_TEXT) //The new name for the file (e.g. report.pdf)
`rename_folder` props:
  folderId★(SHORT_TEXT) //The ID of the folder to rename
  newName★(SHORT_TEXT) //The new name for the folder
`remove_item_permission` props:
  itemId★(SHORT_TEXT) //The ID of the file or folder
  permissionId★(SHORT_TEXT) //The ID of the permission to remove
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### microsoft-excel-365  v2.0.1 | OAuth2
*Spreadsheet software by Microsoft*
**Triggers:** `new_row` `new_row_in_table` `new_worksheet` `updated_row`
**Actions:** `append_row` `get_worksheets` `get_worksheet_rows` `update_row` `update_table_row` `clear_worksheet` `delete_worksheet` `get_workbooks` `delete_workbook` `add_worksheet` `get_table_rows` `get_table_columns` `create_table` `delete_table` `lookup_table_column` `append_table_rows` `convert_to_range` `createWorkbook` `clear_column` `clear_range` `clear_row` `create_worksheet` `find_row` `get_range` `getRowById` `get_row_item_at` `get_worksheet` `rename_worksheet` `count_if_column` `search_files` `search_shared_files` `custom_api_call`
`new_row` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  max_rows_to_poll(NUMBER)=10 //The maximum number of rows to poll, the rest will be polled 
`new_row_in_table` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
  has_headers★(CHECKBOX)=true //Enable this if the first row of your table is a header row.
`new_worksheet` props:
  workbook_id★(DROPDOWN)
`updated_row` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  has_headers★(CHECKBOX)=false //Enable this if the first row of your worksheet should be tre
`append_row` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  first_row_headers★(CHECKBOX)=false //If the first row is headers
  values★(DYNAMIC) //The values to insert
`get_worksheets` props:
  workbook★(DROPDOWN)
  returnAll(CHECKBOX)=false //If checked, all worksheets will be returned
  limit(NUMBER)=10 //Limit the number of worksheets returned
`get_worksheet_rows` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  range(SHORT_TEXT) //Range of the rows to retrieve (e.g., A2:B2)
  headerRow(NUMBER) //Row number of the header
  firstDataRow(NUMBER) //Row number of the first data row
`update_row` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  row_number★(NUMBER) //The row number to update
  first_row_headers★(CHECKBOX)=false //If the first row is headers
  values★(DYNAMIC) //The values to insert
`update_table_row` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
  row_index★(NUMBER) //The zero-based index of the row to update (0 = first data ro
  values★(DYNAMIC) //The values to insert
`clear_worksheet` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  range(SHORT_TEXT) //The range in A1 notation (e.g., A2:B2) to clear in the works
`delete_worksheet` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
`get_workbooks` props:
  limit(NUMBER) //Limits the number of workbooks returned, returns all workboo
`delete_workbook` props:
  workbook_id★(DROPDOWN)
`add_worksheet` props:
  workbook_id★(DROPDOWN)
  worksheet_name(SHORT_TEXT)='Sheet' //The name of the new worksheet
`get_table_rows` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table★(DROPDOWN)
  skip(NUMBER) //Number of rows to skip from the start (for pagination).
  limit(NUMBER) //Limit the number of rows retrieved.
`get_table_columns` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table★(DROPDOWN)
  limit(NUMBER) //Limit the number of columns retrieved
`create_table` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  selectRange★(DROPDOWN) //How to select the range for the table
  range(SHORT_TEXT)='A1:B2' //The range of cells in A1 notation (e.g., A2:B2) that will be
  hasHeaders★(CHECKBOX)=true //Whether the range has column labels
`delete_table` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
`lookup_table_column` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
  lookup_column★(SHORT_TEXT) //The column name to lookup the value in
  lookup_value★(SHORT_TEXT) //The value to lookup
  return_all_matches(CHECKBOX)=false //If checked, all matching rows will be returned
`append_table_rows` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
  values★(DYNAMIC) //The values to insert
`convert_to_range` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
`createWorkbook` props:
  name★(SHORT_TEXT) //The name of the new workbook
  parentFolder★(DROPDOWN) //The parent folder to use
`clear_column` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  column_index★(NUMBER) //The 1-based index of the column to be cleared (e.g., 1 for c
  applyTo★(STATIC_DROPDOWN)='All' ["All (Contents and Formatting)"|"Contents Only"|"Formats Only"] //Specify what to clear from the column.
`clear_range` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  range★(SHORT_TEXT) //The range of cells to clear, in A1 notation (e.g., "A1:C5").
  applyTo★(STATIC_DROPDOWN)='All' ["All (Contents and Formatting)"|"Contents Only"|"Formats Only"] //Specify what to clear from the range.
`clear_row` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  row_id★(NUMBER) //The number of the row to be cleared (e.g., 5 for the 5th row
  applyTo★(STATIC_DROPDOWN)='All' ["All (Contents and Formatting)"|"Contents Only"|"Formats Only"] //Specify what to clear from the row.
`create_worksheet` props:
  workbook_id★(DROPDOWN)
  name(SHORT_TEXT) //The name for the new worksheet. If not provided, a default n
  headers(ARRAY) //Optional: A list of headers to add to the first row. A table
`find_row` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
  lookup_column★(DROPDOWN) //The column to search in.
  lookup_value★(SHORT_TEXT) //The value to find in the lookup column.
`get_range` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  range★(SHORT_TEXT) //The range of cells to retrieve, in A1 notation (e.g., "A1:C1
`getRowById` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
  row_id★(NUMBER) //The zero-based index of the row to retrieve (e.g., 0 for the
`get_row_item_at` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  table_id★(DROPDOWN)
  row_index★(NUMBER) //The zero-based index of the row (0 = first data row, 1 = sec
  column_identifier★(STATIC_DROPDOWN) ["Column Name"|"Column Index"] //Identify the column by name or by index (0-based).
  column_name(DROPDOWN) //The column name (header) to get the value from.
  column_index(NUMBER) //The zero-based index of the column (0 = first column).
`get_worksheet` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
`rename_worksheet` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  new_name★(SHORT_TEXT) //The new name for the worksheet. The name must adhere to the 
`count_if_column` props:
  workbook_id★(DROPDOWN)
  worksheet_id★(DROPDOWN)
  range★(SHORT_TEXT) //The cell range to count in, in A1 notation (e.g., "A2:A100" 
  match_value★(SHORT_TEXT) //The value to count (e.g., "Yes", "100"). Cells that equal th
  match_exact(CHECKBOX)=true //If checked, only cells that exactly equal the match value ar
`search_files` props:
  query★(SHORT_TEXT) //The text to search for (matched against filename, metadata, 
  limit(NUMBER)=50 //Maximum number of results to return (1–200).
`search_shared_files` props:
  limit(NUMBER)=50 //Maximum number of items to return (1–200).
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### microsoft-365-people  v2.0.0 | OAuth2
*Manage contacts in Microsoft 365 People*
**Triggers:** `newOrUpdatedContact`
**Actions:** `createContact` `deleteContact` `updateContact` `createContactFolder` `getContactFolder` `searchContacts` `custom_api_call`
`createContact` props:
  displayName(SHORT_TEXT)
  givenName(SHORT_TEXT)
  middleName(SHORT_TEXT)
  surname(SHORT_TEXT)
  emailAddresses(ARRAY)
  mobilePhone(SHORT_TEXT)
  assistantName(SHORT_TEXT)
  birthday(DATE_TIME)
  businessStreet(SHORT_TEXT)
  businessCity(SHORT_TEXT)
  businessState(SHORT_TEXT)
  businessPostalCode(SHORT_TEXT)
  businessCountryOrRegion(SHORT_TEXT)
  children(ARRAY)
  companyName(SHORT_TEXT)
  department(SHORT_TEXT)
  homeStreet(SHORT_TEXT)
  homeCity(SHORT_TEXT)
  homeState(SHORT_TEXT)
  homePostalCode(SHORT_TEXT)
  homeCountryOrRegion(SHORT_TEXT)
  imAddresses(ARRAY)
  initials(SHORT_TEXT)
  jobTitle(SHORT_TEXT)
  manager(SHORT_TEXT)
  nickName(SHORT_TEXT)
  officeLocation(SHORT_TEXT)
  otherStreet(SHORT_TEXT)
  otherCity(SHORT_TEXT)
  otherState(SHORT_TEXT)
  otherPostalCode(SHORT_TEXT)
  otherCountryOrRegion(SHORT_TEXT)
  parentFolder(DROPDOWN) //Select a parent folder
  personalNotes(LONG_TEXT)
  profession(SHORT_TEXT)
  spouseName(SHORT_TEXT)
  title(SHORT_TEXT)
`deleteContact` props:
  contactId★(DROPDOWN) //Select a Contact
`updateContact` props:
  contactId★(DROPDOWN) //Select a Contact
  displayName(SHORT_TEXT)
  givenName(SHORT_TEXT)
  middleName(SHORT_TEXT)
  surname(SHORT_TEXT)
  emailAddresses(ARRAY)
  mobilePhone(SHORT_TEXT)
  assistantName(SHORT_TEXT)
  birthday(DATE_TIME)
  businessStreet(SHORT_TEXT)
  businessCity(SHORT_TEXT)
  businessState(SHORT_TEXT)
  businessPostalCode(SHORT_TEXT)
  businessCountryOrRegion(SHORT_TEXT)
  children(ARRAY)
  companyName(SHORT_TEXT)
  department(SHORT_TEXT)
  homeStreet(SHORT_TEXT)
  homeCity(SHORT_TEXT)
  homeState(SHORT_TEXT)
  homePostalCode(SHORT_TEXT)
  homeCountryOrRegion(SHORT_TEXT)
  imAddresses(ARRAY)
  initials(SHORT_TEXT)
  jobTitle(SHORT_TEXT)
  manager(SHORT_TEXT)
  nickName(SHORT_TEXT)
  officeLocation(SHORT_TEXT)
  otherStreet(SHORT_TEXT)
  otherCity(SHORT_TEXT)
  otherState(SHORT_TEXT)
  otherPostalCode(SHORT_TEXT)
  otherCountryOrRegion(SHORT_TEXT)
  parentFolder(DROPDOWN) //Select a parent folder
  personalNotes(LONG_TEXT)
  profession(SHORT_TEXT)
  spouseName(SHORT_TEXT)
  title(SHORT_TEXT)
`createContactFolder` props:
  displayName★(SHORT_TEXT)
  parentFolder(DROPDOWN) //Select a parent folder
`getContactFolder` props:
  contactFolder★(DROPDOWN) //Select a contact folder
`searchContacts` props:
  searchValue★(SHORT_TEXT) //Find contacts by name, email, or other properties.
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### microsoft-onenote  v2.0.0 | OAuth2
*Microsoft OneNote is a note-taking app that allows you to create, edit, and share notes with others.*
**Triggers:** `new_note_in_section`
**Actions:** `create_notebook` `create_section` `create_note_in_section` `create_page` `create_image_note` `append_note`

### microsoft-sharepoint  v2.0.0 | OAuth2
*Collaborate and manage content with Microsoft SharePoint. Automate file uploads, folder creation, an*
**Actions:** `microsoft_sharepoint_create_folder` `microsoft_sharepoint_create_list` `microsoft_sharepoint_create_list_item` `microsoft_sharepoint_update_list_item` `microsoft_sharepoint_delete_list_item` `microsoft_sharepoint_search_list_item` `microsoft_sharepoint_upload_file` `custom_api_call`

### microsoft-power-bi  v2.0.1 | OAuth2
*Manage Microsoft Power BI resources — create and refresh datasets, push data rows, list and get work*
**Triggers:** `new_dataset_refresh`
**Actions:** `list_workspaces` `list_datasets` `list_reports` `list_dashboards` `get_dashboard_tiles` `get_report_pages` `create_dataset` `push_rows_to_dataset_table` `delete_rows_from_table` `refresh_dataset` `get_refresh_history` `clone_report` `add_dashboard_in_group` `add_dashboard_in_my_workspace` `add_rows_in_my_workspace_dataset` `get_dashboard_tile_from_my_workspace` `get_dashboard_tile_from_group` `get_dashboard` `get_datasets_from_my_workspace` `get_report_from_my_workspace` `get_report_from_group` `get_specific_dataset_from_my_workspace` `get_specific_dataset_from_group` `refresh_dataset_in_my_workspace` `delete_dataset_in_my_workspace` `delete_dataset_in_group` `get_dataset_users_from_my_workspace` `get_dataset_users_from_group` `custom_api_call`

### microsoft-todo  v2.0.1 | OAuth2
*Cloud based task management application.*
**Triggers:** `new_task_created` `new_or_updated_task` `task_completed` `new_list` `task_status_changes_to` `deleted_task`
**Actions:** `create_task` `create_task_list` `update_task` `find_task_list_by_name` `find_task_by_title` `complete_task` `get_task` `create_category` `delete_category` `list_time_zones` `custom_api_call`

### microsoft-dynamics-365-business-central  v2.0.0 | OAuth2
*All-in-one business management solution by Microsoft.*
**Triggers:** `new-or-updated-record`
**Actions:** `create-record` `delete-record` `get-record` `update-record` `search-records` `custom_api_call`

### microsoft-dynamics-crm  v2.0.0 | OAuth2
*Customer relationship management software package developed by Microsoft.*
**Actions:** `dynamics_crm_create_record` `dynamics_crm_delete_record` `dynamics_crm_get_record` `dynamics_crm_update_record` `custom_api_call`

## ★ COMMUNICATION

### slack  v2.0.3 | OAuth2
*Channel-based messaging platform*
**Triggers:** `new-message` `new-message-in-channel` `new-direct-message` `new_mention` `new-mention-in-direct-message` `new_reaction_added` `channel_created` `new_command` `new-command-in-direct-message` `new-user` `new-saved-message` `new-team-custom-emoji` `new-file` `new-message-from-query` `new-message-in-private-channel` `new-pushed-message`
**Actions:** `slack-add-reaction-to-message` `send_direct_message` `send_channel_message` `request_approval_direct_message` `request_approval_message` `request_action_direct_message` `request_action_message` `uploadFile` `get-file` `searchMessages` `slack-find-user-by-email` `slack-find-user-by-handle` `find-user-by-id` `updateMessage` `slack-create-channel` `slack-update-profile` `getChannelHistory` `slack-set-user-status` `markdownToSlackFormat` `retrieveThreadMessages` `set-channel-topic` `get-message` `invite-user-to-channel` `send-private-channel-message` `delete-message` `remove-user-from-channel` `create-private-channel` `add-reminder` `find-public-channel` `edit-message` `find-user-by-name` `find-user-by-username` `find-message` `test_private_channel_access` `custom_api_call`

### whatsapp  v2.1.1 | Custom(access_token,businessAccountId)
*Manage your WhatsApp business account*
**Actions:** `sendMessage` `sendMedia` `send-template-message` `send-template-message-variable`
`sendMessage` props:
  phone_number_id★(DROPDOWN) //Phone number ID that will be used to send the message.
  to★(SHORT_TEXT) //The recipient of the message
  text★(LONG_TEXT) //The message to send
`sendMedia` props:
  phone_number_id★(DROPDOWN) //Phone number ID that will be used to send the message.
  to★(SHORT_TEXT) //The recipient of the message
  type★(DROPDOWN) //The type of media to send
  media★(SHORT_TEXT) //The URL of the media to send
  caption(LONG_TEXT) //A caption for the media
  filename(LONG_TEXT) //Filename of the document to send
`send-template-message` props:
  phone_number_id★(DROPDOWN) //Phone number ID that will be used to send the message.
  to★(SHORT_TEXT) //Recipient phone number.
  message_template_id★(DROPDOWN)
  message_template_fields★(DYNAMIC)
`send-template-message-variable` props:
  whatsappconnection★(DROPDOWN) //Select WhatsApp Connection
  connectionDetails(DYNAMIC)

### telegram-bot  v2.0.0 | API Key
*Build chatbots for Telegram*
**Triggers:** `new_telegram_message`
**Actions:** `send_text_message` `send_media` `get_chat_member` `create_invite_link` `custom_api_call`
`send_text_message` props:
  instructions(MARKDOWN) //**How to obtain Chat ID:** 1. Search for the bot "@getmyid_b
  chat_id★(SHORT_TEXT)
  message_thread_id(SHORT_TEXT) //Unique identifier for the target message thread of the forum
  format(STATIC_DROPDOWN)='MarkdownV2' ["Markdown"|"HTML"] //Choose format you want
  instructions_format(MARKDOWN) //[Link example](https://core.telegram.org/bots/api#formatting
  web_page_preview(CHECKBOX)=false //Disable link previews for links in this message
  message★(LONG_TEXT) //The message to be sent
  reply_markup(JSON) //Additional interface options. A JSON-serialized object for a
`send_media` props:
  instructions(MARKDOWN) //**How to obtain Chat ID:** 1. Search for the bot "@getmyid_b
  chat_id★(SHORT_TEXT)
  message_thread_id(SHORT_TEXT) //Unique identifier for the target message thread of the forum
  media_type(STATIC_DROPDOWN) ["Image"|"Video"|"Sticker"|"GIF"]
  media(DYNAMIC)
  format(STATIC_DROPDOWN)='MarkdownV2' ["Markdown"|"HTML"] //Choose format you want
  instructions_format(MARKDOWN) //[Link example](https://core.telegram.org/bots/api#formatting
  message★(LONG_TEXT) //The message to be sent
  reply_markup(JSON) //Additional interface options. A JSON-serialized object for a
`get_chat_member` props:
  instructions(MARKDOWN) //**How to obtain Chat ID:** 1. Search for the bot "@getmyid_b
  chat_id★(SHORT_TEXT)
  user_id★(SHORT_TEXT) //Unique identifier for the user
`create_invite_link` props:
  instructions(MARKDOWN) //**How to obtain Chat ID:** 1. Search for the bot "@getmyid_b
  chat_id★(SHORT_TEXT)
  name(SHORT_TEXT) //Name of the invite link (max 32 chars)
  expire_date(DATE_TIME) //Point in time when the link will expire
  member_limit(NUMBER) //Maximum number of users that can be members of the chat simu
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### discord  v2.0.0 | API Key
*Instant messaging and VoIP social platform*
**Triggers:** `new_message` `new_member`
**Actions:** `sendMessageWithBot` `send_message_webhook` `request_approval_message` `add_role_to_member` `remove_role_from_member` `remove_member_from_guild` `list_guild_members` `rename_channel` `create_channel` `delete_channel` `find_channel` `remove_ban_from_user` `createGuildRole` `deleteGuildRole` `ban_guild_member` `custom_api_call`
`new_message` props:
  limit(NUMBER)=50 //The number of messages to fetch
  channel★(DROPDOWN) //List of channels
`new_member` props:
  limit(NUMBER)=50 //The number of members to fetch (max 1000)
  guildId★(SHORT_TEXT) //The ID of the Discord guild (server)
`sendMessageWithBot` props:
  channel_id★(DROPDOWN) //List of channels
  message(LONG_TEXT) //Message content to send.
  files(ARRAY)
`send_message_webhook` props:
  webhook_url★(SHORT_TEXT)
  username(SHORT_TEXT)
  content★(LONG_TEXT)
  avatar_url(SHORT_TEXT) //The avatar url for webhook
  embeds(JSON) //Embeds to send along with the message
  tts(CHECKBOX) //Robot reads the message
`request_approval_message` props:
  content★(LONG_TEXT) //The message you want to send
  channel★(DROPDOWN) //List of channels
`add_role_to_member` props:
  guild_id★(DROPDOWN) //List of guilds
  user_id★(SHORT_TEXT) //The user id of the member
  role_id★(DROPDOWN) //List of roles
`remove_role_from_member` props:
  guild_id★(DROPDOWN) //List of guilds
  user_id★(SHORT_TEXT) //The user id of the member
  role_id★(DROPDOWN) //List of roles
`remove_member_from_guild` props:
  guild_id★(DROPDOWN) //List of guilds
  user_id★(SHORT_TEXT) //The user id of the member
`list_guild_members` props:
  guild_id★(DROPDOWN) //List of guilds
  shortText★(SHORT_TEXT) //Search for a member
`rename_channel` props:
  channel_id★(DROPDOWN) //List of channels
  name★(SHORT_TEXT) //The new name of the channel
`create_channel` props:
  guild_id★(DROPDOWN) //List of guilds
  name★(SHORT_TEXT) //The name of the new channel
`delete_channel` props:
  channel_id★(DROPDOWN) //List of channels
`find_channel` props:
  guild_id★(DROPDOWN) //List of guilds
  name★(SHORT_TEXT) //The name of the channel
`remove_ban_from_user` props:
  guild_id★(DROPDOWN) //List of guilds
  user_id★(SHORT_TEXT) //The ID of the user
  unban_reason(SHORT_TEXT) //The reason for unbanning the user
`createGuildRole` props:
  guild_id★(DROPDOWN) //List of guilds
  role_name★(SHORT_TEXT) //The name of the role
  role_color(SHORT_TEXT) //The RGB color of the role (may be better to set manually on 
  display_separated(CHECKBOX) //Whether the role should be displayed separately in the sideb
  role_mentionable(CHECKBOX) //Whether the role can be mentioned by other users
  creation_reason(SHORT_TEXT) //The reason for creating the role
`deleteGuildRole` props:
  guild_id★(DROPDOWN) //List of guilds
  role_id★(DROPDOWN) //List of roles
  deletion_reason(SHORT_TEXT) //The reason for deleting the role
`ban_guild_member` props:
  guild_id★(DROPDOWN) //List of guilds
  user_id★(SHORT_TEXT) //The user id of the member
  ban_reason(SHORT_TEXT) //The reason for banning the member
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### twilio  v2.0.0 | Basic Auth
*Cloud communications platform for building SMS, Voice & Messaging applications*
**Triggers:** `new_incoming_sms`
**Actions:** `send_sms` `call_phone` `custom_api_call`
`new_incoming_sms` props:
  phone_number★(DROPDOWN) //The phone number to send the message from
`send_sms` props:
  from★(DROPDOWN) //The phone number to send the message from
  body★(SHORT_TEXT) //The body of the message to send
  to★(SHORT_TEXT) //The phone number to send the message to
`call_phone` props:
  from★(DROPDOWN) //The phone number to send the message from
  to★(SHORT_TEXT) //The phone number to call
  message★(LONG_TEXT) //The message to say during the call
  voice(DROPDOWN)='alice' //Select the voice for the call
  language(DROPDOWN)='en-US' //Select the language for the call
  send_digits(SHORT_TEXT) //DTMF tones to send during the call (e.g., 1234 for keypad pr
  status_callback(SHORT_TEXT) //URL to send status callbacks to (optional)
  status_callback_method(DROPDOWN) //HTTP method for status callbacks
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### smtp  v2.0.0 | Custom(host,email,password,port,TLS)
*Send emails using Simple Mail Transfer Protocol*
**Actions:** `send-email`
`send-email` props:
  from★(SHORT_TEXT)
  senderName(SHORT_TEXT)
  to★(ARRAY)
  cc(ARRAY)
  replyTo(SHORT_TEXT)
  bcc(ARRAY)
  subject★(SHORT_TEXT)
  body_type★(STATIC_DROPDOWN)='plain_text' ["plain text"|"html"]
  body★(LONG_TEXT)
  customHeaders(OBJECT)
  attachments(ARRAY)

### sendgrid  v2.0.0 | API Key
*Email delivery service for sending transactional and marketing emails*
**Actions:** `send_email` `send_dynamic_template` `custom_api_call`
`send_email` props:
  to★(ARRAY) //Emails of the recipients
  from★(SHORT_TEXT) //Sender email, must be on your SendGrid
  from_name(SHORT_TEXT) //Sender name
  reply_to(SHORT_TEXT) //Email to receive replies on (defaults to sender)
  subject★(SHORT_TEXT)
  content_type★(DROPDOWN)
  content★(SHORT_TEXT) //HTML is only allowed if you selected HTML as type
`send_dynamic_template` props:
  to★(ARRAY) //Emails of the recipients
  from_name(SHORT_TEXT) //Sender name
  from★(SHORT_TEXT) //Sender email, must be on your SendGrid
  template_id★(SHORT_TEXT) //Dynamic template id
  template_data★(JSON) //Dynamic template data
  reply_to(SHORT_TEXT) //Email to receive replies on (defaults to sender)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### imap  v2.0.0 | Custom(host,username,password,port,tls)
*Receive new email trigger*
**Triggers:** `new_email`
`new_email` props:
  mailbox★(DROPDOWN) //Select the mailbox to search
  filterInstructions(MARKDOWN) //**Filter Emails:** You can add Branch Piece to filter emails

### ntfy  v2.0.0 | Custom(base_url,access_token)
*Notification management made easy*
**Actions:** `send_notification` `custom_api_call`
`send_notification` props:
  topic★(SHORT_TEXT) //The topic/channel to send the notification to, e.g. test1
  title(SHORT_TEXT) //The title of the notification
  message★(LONG_TEXT) //The message to send
  priority(SHORT_TEXT) //The priority of the notification (1-5). 1 is lowest priority
  tags(ARRAY) //The tags for the notification.
  icon(SHORT_TEXT) //The absolute URL to your icon, e.g. https://example.com/comm
  actions(LONG_TEXT) //Add Action buttons to notifications, see https://docs.ntfy.s
  click(SHORT_TEXT) //You can define which URL to open when a notification is clic
  delay(SHORT_TEXT) //Let ntfy send messages at a later date, e.g. 'tomorrow, 10am
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### pushover  v2.0.0 | Custom(api_token,user_key)
*Simple push notification service*
**Actions:** `send_notification`
`send_notification` props:
  title(SHORT_TEXT) //The title of the notification
  message★(LONG_TEXT) //The message to send
  html(CHECKBOX) //To enable HTML parsing
  priority(NUMBER) //The priority of the notification (-2 to 2). -2 is lowest pri
  retry(NUMBER) //Works only if priority is set to 2. Specifies how often (in 
  expire(NUMBER) //Works only if priority is set to 2. Specifies how many secon
  url(SHORT_TEXT) //A supplementary URL to show with your message.
  url_title(SHORT_TEXT) //A title for the URL specified as the url input parameter, ot
  timestamp(SHORT_TEXT) //a Unix timestamp of a time to display instead of when our AP
  device(SHORT_TEXT) //The name of one of your devices to send just to that device 

### line  v2.0.0 | API Key
*Build chatbots for LINE*
**Triggers:** `new-message`
**Actions:** `push_message` `custom_api_call`
`new-message` props:
  md(MARKDOWN) //- Create Line bot account from Developer Console - Go to the
`push_message` props:
  userId★(SHORT_TEXT) //The user id can be obtained from the webhook payload
  text★(SHORT_TEXT)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### messagebird  v2.0.0 | Custom(apiKey,workspaceId,channelId)
*Unified CRM for Marketing, Service & Payments*
**Actions:** `send-sms` `listMessages` `custom_api_call`

### clicksend  v2.0.0 | Basic Auth
*Cloud-based messaging platform for sending SMS, MMS, voice, email, and more.*
**Triggers:** `new_incoming_sms`
**Actions:** `send_sms` `send_mms` `create_contact` `update_contact` `delete_contact` `create_contact_list` `find_contact_by_email` `find_contact_by_phone` `find_contact_lists` `custom_api_call`

### mattermost  v2.0.1 | Custom(workspace_url,token)
*Open-source, self-hosted Slack alternative*
**Actions:** `send_message` `custom_api_call`

### bluesky  v2.0.0 | Custom(pdsHost,identifier,password)
*Post updates, interact with content, and monitor your Bluesky timeline and followers.*
**Triggers:** `newPostsByAuthor` `newFollowerOnAccount` `newTimelinePosts` `newPost`
**Actions:** `createPost` `likePost` `repostPost` `findPost` `findThread`
`newPostsByAuthor` props:
  authorSelection★(STATIC_DROPDOWN)='following' ["From my following list"|"Enter handle manually"] //Choose how to select the author
  authorFromFollowing(DROPDOWN) //Choose from accounts you follow
  authorHandle(SHORT_TEXT) //Enter the Bluesky username (e.g., username.bsky.social)
  includeReplies(CHECKBOX)=false //Include reply posts by this author
  includeReposts(CHECKBOX)=false //Include posts that this author reposted
`newPost` props:
  searchQuery★(SHORT_TEXT) //Keywords, hashtags (#example), or mentions (@handle) to find
  searchLanguage(STATIC_DROPDOWN)='en' //Filter by language
  includeImages(CHECKBOX) //Only posts with/without images
  includeVideos(CHECKBOX) //Only posts with/without videos
  sortBy(STATIC_DROPDOWN)='latest' ["Latest First"|"Most Popular"] //How to sort results
`createPost` props:
  postType(STATIC_DROPDOWN)='text' ["Text Post"|"Photo Post"|"Link Share"|"Reply"|"Repost with Comment"] //Type of content you're sharing
  text★(LONG_TEXT) //What do you want to post? (Max 300 characters)
  language(STATIC_DROPDOWN)='en' //Language of your post
  imageUrls(ARRAY) //Add up to 4 images by URL
  imageDescriptions(ARRAY) //Describe each image for accessibility
  videoUrl(SHORT_TEXT) //Link to video file (MP4, max 100MB)
  videoAltText(LONG_TEXT) //Describe the video for accessibility
  videoCaptions(ARRAY) //Caption file URLs (optional)
  linkUrl(SHORT_TEXT) //URL to share with your post
  replyToPost(SHORT_TEXT) //URL of post to reply to
  threadContent(ARRAY) //Create additional connected posts
  additionalHashtags(SHORT_TEXT) //Add hashtags (e.g., tech,bluesky)
  contentWarnings(STATIC_MULTI_SELECT_DROPDOWN) ["Adult Content"|"Graphic Content"|"Sensitive Topic"|"Violence"|"Spam/Promotional"] //Add warnings for sensitive content
  audience(STATIC_DROPDOWN)='public' ["Everyone (Public)"|"Followers only"|"Private/Unlisted"] //Who can see this post
`likePost` props:
  selectionMethod★(STATIC_DROPDOWN)='timeline' ["From my timeline"|"Enter URL manually"] //How to choose the post
  postSelection(DROPDOWN) //Choose from your recent timeline posts (only when "From my t
  postUrl(SHORT_TEXT) //Paste the Bluesky post URL
`repostPost` props:
  selectionMethod★(STATIC_DROPDOWN)='timeline' ["From my timeline"|"Enter URL manually"] //How to choose the post
  postSelection(DROPDOWN) //Choose from your recent timeline posts (only when "From my t
  postUrl(SHORT_TEXT) //Paste the Bluesky post URL
`findPost` props:
  postUrl★(SHORT_TEXT) //Paste the Bluesky post URL (e.g., https://bsky.app/profile/u
`findThread` props:
  postUrl★(SHORT_TEXT) //Paste the Bluesky post URL (e.g., https://bsky.app/profile/u
  depth(STATIC_DROPDOWN)='10' ["1 level"|"2 levels"|"3 levels"|"5 levels"|"10 levels"|"20 levels"|"50 levels"|"100 levels (max)"] //How many levels deep to retrieve replies
  parentHeight(STATIC_DROPDOWN)='3' ["No parents"|"1 parent"|"2 parents"|"3 parents"|"5 parents"|"10 parents"|"20 parents"|"All parents (80 max)"] //How many parent posts to retrieve

### twitter  v2.0.0 | Custom(consumerKey,consumerSecret,accessToken,accessTokenSecret)
*Social media platform with over 500 million user*
**Actions:** `create-tweet` `create-reply`

### linkedin  v2.0.2 | OAuth2
*Connect and network with professionals*
**Actions:** `create_share_update` `create_company_update` `custom_api_call`

### facebook-pages  v2.0.0 | OAuth2
*Manage your Facebook pages to grow your business*
**Actions:** `create_post` `create_photo_post` `create_video_post`

### facebook-leads  v2.0.0 | OAuth2
*Capture leads from Facebook*
**Triggers:** `new_lead`

### instagram-business  v2.0.0 | OAuth2
*Grow your business on Instagram*
**Actions:** `upload_photo` `upload_reel`

### zoom  v2.0.0 | OAuth2
*Video conferencing, web conferencing, webinars, screen sharing*
**Actions:** `zoom_create_meeting` `zoom_create_meeting_registrant` `custom_api_call`

### azure-communication-services  v2.0.0 | API Key
*Communication services from Microsoft Azure*
**Actions:** `send_email`
`send_email` props:
  from★(SHORT_TEXT) //Sender email
  to★(ARRAY) //Emails of the recipients
  cc(ARRAY) //List of emails in cc
  bcc(ARRAY) //List of emails in bcc
  reply_to(SHORT_TEXT) //Email to receive replies on (defaults to sender)
  subject★(SHORT_TEXT)
  content_type★(DROPDOWN)='html'
  content★(SHORT_TEXT) //HTML is only allowed if you selected HTML as type

### instasent  v2.0.0 | Custom(projectId,datasourceId,apiKey)
*Manage your SMS and messaging workflows with Instasent. Automate contact management and track messag*
**Actions:** `add_or_update_contact` `delete_contact` `add_event`

### heartbeat  v2.0.0 | API Key
*Monitoring and alerting made easy*
**Actions:** `heartbeat_create_user` `custom_api_call`

### contiguity  v2.0.0 | API Key
*Communications for what you're building*
**Actions:** `send_text` `send_imessage` `custom_api_call`

### seven  v2.0.0 | API Key
*Business Messaging Gateway*
**Triggers:** `new_incoming_sms`
**Actions:** `send-sms` `send-voice-call` `lookup`

### gotify  v2.0.0 | Custom(base_url,app_token)
*Self-hosted push notification service*
**Actions:** `send_notification`

### mastodon  v2.0.0 | Custom(base_url,access_token)
*Open-source decentralized social network*
**Actions:** `post_status` `custom_api_call`

### matrix  v2.0.0 | Custom(base_url,access_token)
*Open standard for interoperable, decentralized, real-time communication*
**Actions:** `send_message` `custom_api_call`

### missive  v2.0.0 | API Key
*Streamline your team communication and customer support with Missive. Manage shared inboxes, collabo*
**Triggers:** `new_message` `new_comment` `new_contact` `new_contact_book` `new_contact_group`
**Actions:** `create_contact` `update_contact` `create_draft_post` `create_task` `find_contact` `custom_api_call`

### manychat  v2.0.0 | API Key
*Automations for Instagram, WhatsApp, TikTok, and Messenger marketing.*
**Actions:** `addTagToUser` `createSubscriber` `findUserByCustomField` `findUserByName` `removeTagFromUser` `sendContentToUser` `setCustomField`

### bonjoro  v2.0.0 | Custom(apiKey)
*Send personal video messages to delight customers*
**Actions:** `add_greet` `custom_api_call`

### respond-io  v2.0.0 | Custom(token)
*Manage your customer conversations across multiple channels with Respond.io. Automate contact manage*
**Triggers:** `contact_tag_updated` `contact_updated` `conversation_closed` `conversation_opened` `new_contact` `new_incoming_message` `new_outgoing_message`
**Actions:** `add_comment_to_conversation` `add_tag_to_contact` `assign_or_unassign_conversation` `create_contact` `create_or_update_contact` `delete_contact` `find_contact` `open_conversation` `custom_api_call`

### zoho-cliq  v2.0.0 | OAuth2
*Team messaging and collaboration platform by Zoho*
**Actions:** `send_channel_message` `send_direct_message` `send_card_to_channel` `send_card_to_chat` `send_card_to_user` `send_message_to_chat` `send_thread_message` `get_channel` `custom_api_call`

## ★ CRM & SALES

### hubspot  v2.0.0 | OAuth2
*Powerful CRM that offers tools for sales, customer service, and marketing automation.*
**Triggers:** `new-or-updated-company` `new-or-updated-contact` `new-deal-property-change` `new-email-subscriptions-timeline` `new-or-updated-line-item` `new-company` `new-company-property-change` `new-contact` `new-contact-in-list` `new-contact-property-change` `new-blog-article` `new-custom-object` `new-custom-object-property-change` `new-deal` `new-email-event` `new-engagement` `new-form-submission` `new-line-item` `new-product` `new-ticket` `new-ticket-property-change` `new-or-updated-product` `new-task` `deal-stage-updated`
**Actions:** `add_contact_to_list` `add-contact-to-workflow` `create-associations` `create-company` `create-contact` `create-blog-post` `create-custome-object` `create-deal` `create-line-item` `create-page` `create-or-update-contact` `create-product` `create-ticket` `get-company` `get-contact` `get-custom-object` `get-deal` `get-line-item` `get-product` `get-page` `get-ticket` `delete-page` `remove-associations` `remove-contact-from-list` `remove-email-subscription` `update-company` `update-contact` `update-custome-object` `update-deal` `update-line-item` `update-product` `update-ticket` `upload-file` `find-associations` `find-company` `find-contact` `find-custom-object` `find-deal` `find-line-item` `find-product` `find-ticket` `get-owner-by-email` `get-owner-by-id` `get-pipeline-stage-details` `custom_api_call`

### pipedrive  v2.0.0 | OAuth2
*Sales CRM and pipeline management software*
**Triggers:** `new_person` `new_deal` `new_activity` `new-note` `updated_person` `updated_deal` `updated-deal-stage` `new-lead` `new-organization` `updated-organization` `activity-matching-filter` `deal-matching-filter` `person-matching-filter` `organization-matching-filter`
**Actions:** `add-follower` `get-note` `create-note` `add-labels-to-person` `add-product-to-deal` `attach-file` `create-activity` `update-activity` `create-deal` `update-deal` `create-lead` `update-lead` `create-organization` `update-organization` `create-person` `update-person` `create-product` `find-deals-associated-with-person` `find-product` `find-products` `find-notes` `get-product` `find-organization` `find-person` `find-deal` `find-activity` `find-user` `custom_api_call`
`updated_deal` props:
  filter_by(STATIC_DROPDOWN) ["Deal Status"|"Stage in Pipeline"]
  filter_by_field_value(DYNAMIC)
  field_to_watch(DROPDOWN)
`updated-deal-stage` props:
  stage_id(DROPDOWN)
`activity-matching-filter` props:
  filterId★(DROPDOWN)
`deal-matching-filter` props:
  filterId★(DROPDOWN)
  status(STATIC_DROPDOWN)='all_not_deleted' ["Open"|"Won"|"Lost"|"Deleted"|"All(Not Deleted)"]
`person-matching-filter` props:
  filterId★(DROPDOWN)
`organization-matching-filter` props:
  filterId★(DROPDOWN)
`add-follower` props:
  followerId★(DROPDOWN)
  entity★(STATIC_DROPDOWN) ["Deal"|"Person"|"Organization"|"Product"] //Type of object to add the follower to.
  entityId★(SHORT_TEXT) //ID of the object to add the follower to.
`get-note` props:
  noteId★(NUMBER)
`create-note` props:
  content★(LONG_TEXT)
  dealId(NUMBER) //You can use Find Deal action to retrieve deal ID.
  pinnedToDeal(CHECKBOX)=false
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  pinnedToPerson(CHECKBOX)=false
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  pinnedToOrganization(CHECKBOX)=false
  leadId(SHORT_TEXT)
  pinnedToLead(CHECKBOX)=false
`add-labels-to-person` props:
  personId★(NUMBER) //You can use Find Person action to retrieve person ID.
  labelIds★(MULTI_SELECT_DROPDOWN)
`add-product-to-deal` props:
  dealId★(NUMBER) //You can use Find Deal action to retrieve deal ID.
  productId★(NUMBER) //You can use Find Product action to retrieve product ID.
  price★(NUMBER)
  quantity★(NUMBER)
  discount(NUMBER)
  discountType(STATIC_DROPDOWN) ["Percentage"|"Amount"]
  comments(LONG_TEXT)
  enableProduct(CHECKBOX)=true
  taxMethod(STATIC_DROPDOWN) ["Exclusive"|"Inclusive"|"None"]
  taxPercentage(NUMBER)
`attach-file` props:
  file★(FILE)
  fileName★(SHORT_TEXT)
  dealId(NUMBER) //You can use Find Deal action to retrieve deal ID.
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  productId(NUMBER) //You can use Find Product action to retrieve product ID.
  activityId(NUMBER)
`create-activity` props:
  subject★(SHORT_TEXT)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  dealId(NUMBER) //You can use Find Deal action to retrieve deal ID.
  leadId(SHORT_TEXT)
  assignTo(DROPDOWN)
  type(DROPDOWN)
  dueDate(DATE_TIME) //Please enter date in YYYY-MM-DD format.
  dueTime(SHORT_TEXT) //Please enter time in HH:MM format.
  duration(SHORT_TEXT) //Please enter time in HH:MM format (e.g., "01:30" for 1 hour 
  isDone(CHECKBOX)=false
  busy(STATIC_DROPDOWN) ["Free"|"Busy"]
  note(LONG_TEXT)
  publicDescription(LONG_TEXT)
`update-activity` props:
  activityId★(NUMBER)
  subject(SHORT_TEXT)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  dealId(NUMBER) //You can use Find Deal action to retrieve deal ID.
  leadId(SHORT_TEXT)
  assignTo(DROPDOWN)
  type(DROPDOWN)
  dueDate(DATE_TIME) //Please enter date in YYYY-MM-DD format.
  dueTime(SHORT_TEXT) //Please enter time in HH:MM format.
  duration(SHORT_TEXT) //Please enter time in HH:MM format (e.g., "01:30" for 1 hour 
  isDone(CHECKBOX)=false
  busy(STATIC_DROPDOWN) ["Free"|"Busy"]
  note(LONG_TEXT)
  publicDescription(LONG_TEXT)
`create-deal` props:
  title★(SHORT_TEXT)
  creationTime(DATE_TIME)
  status(STATIC_DROPDOWN) ["Open"|"Won"|"Lost"|"Deleted"]
  stageId(DROPDOWN) //If a stage is chosen above, the pipeline field will be ignor
  pipelineId(DROPDOWN)
  ownerId(DROPDOWN)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  labelIds(MULTI_SELECT_DROPDOWN)
  probability(NUMBER)
  expectedCloseDate(DATE_TIME) //Please enter date in YYYY-MM-DD format.
  dealValue(NUMBER)
  dealValueCurrency(SHORT_TEXT) //Please enter currency code (e.g., "USD", "EUR").
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  customfields(DYNAMIC)
`update-deal` props:
  dealId★(NUMBER) //You can use Find Deal action to retrieve deal ID.
  title(SHORT_TEXT)
  creationTime(DATE_TIME)
  status(STATIC_DROPDOWN) ["Open"|"Won"|"Lost"|"Deleted"]
  stageId(DROPDOWN) //If a stage is chosen above, the pipeline field will be ignor
  pipelineId(DROPDOWN)
  ownerId(DROPDOWN)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  labelIds(MULTI_SELECT_DROPDOWN)
  probability(NUMBER)
  expectedCloseDate(DATE_TIME) //Please enter date in YYYY-MM-DD format.
  dealValue(NUMBER)
  dealValueCurrency(SHORT_TEXT) //Please enter currency code (e.g., "USD", "EUR").
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  customfields(DYNAMIC)
`create-lead` props:
  title★(SHORT_TEXT)
  ownerId(DROPDOWN)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  labelIds(MULTI_SELECT_DROPDOWN)
  expectedCloseDate(DATE_TIME) //Please enter date in YYYY-MM-DD format.
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  channel(DROPDOWN)
  leadValue(NUMBER)
  leadValueCurrency(SHORT_TEXT) //The currency of the lead value (e.g., "USD", "EUR").
  customfields(DYNAMIC)
`update-lead` props:
  leadId★(SHORT_TEXT)
  title(SHORT_TEXT)
  ownerId(DROPDOWN)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  personId(NUMBER) //You can use Find Person action to retrieve person ID.
  labelIds(MULTI_SELECT_DROPDOWN)
  expectedCloseDate(DATE_TIME) //Please enter date in YYYY-MM-DD format.
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  channel(DROPDOWN)
  leadValue(NUMBER)
  leadValueCurrency(SHORT_TEXT) //The currency of the lead value (e.g., "USD", "EUR").
  customfields(DYNAMIC)
`create-organization` props:
  name★(SHORT_TEXT)
  ownerId(DROPDOWN)
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  labelIds(MULTI_SELECT_DROPDOWN)
  address(LONG_TEXT)
  customfields(DYNAMIC)
`update-organization` props:
  organizationId★(NUMBER) //You can use Find Organization action to retrieve org ID.
  name(SHORT_TEXT)
  ownerId(DROPDOWN)
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  labelIds(MULTI_SELECT_DROPDOWN)
  address(LONG_TEXT)
  customfields(DYNAMIC)
`create-person` props:
  name(SHORT_TEXT)
  ownerId(DROPDOWN)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  email(ARRAY)
  phone(ARRAY)
  labelIds(MULTI_SELECT_DROPDOWN)
  firstName(SHORT_TEXT)
  lastName(SHORT_TEXT)
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  marketing_status(STATIC_DROPDOWN) ["No Consent"|"Unsubscribed"|"Subscribed"|"Archived"] //Marketing opt-in status
  customfields(DYNAMIC)
`update-person` props:
  personId★(NUMBER) //You can use Find Person action to retrieve person ID.
  name(SHORT_TEXT)
  ownerId(DROPDOWN)
  organizationId(NUMBER) //You can use Find Organization action to retrieve org ID.
  email(ARRAY)
  phone(ARRAY)
  labelIds(MULTI_SELECT_DROPDOWN)
  firstName(SHORT_TEXT)
  lastName(SHORT_TEXT)
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  marketing_status(STATIC_DROPDOWN) ["No Consent"|"Unsubscribed"|"Subscribed"|"Archived"] //Marketing opt-in status
  customfields(DYNAMIC)
`create-product` props:
  name★(SHORT_TEXT)
  code(SHORT_TEXT)
  description(LONG_TEXT)
  unit(SHORT_TEXT)
  tax(NUMBER)
  isActive(CHECKBOX)=true
  ownerId(DROPDOWN)
  currency(SHORT_TEXT) //Please enter currency code (e.g., "USD", "EUR").
  price(NUMBER)
  cost(NUMBER)
  overheadCost(NUMBER)
  visibleTo(STATIC_DROPDOWN) ["Owner & followers"|"Entire company"]
  customfields(DYNAMIC)
`find-deals-associated-with-person` props:
  personId★(NUMBER) //You can use Find Person action to retrieve person ID.
`find-product` props:
  searchTerm★(SHORT_TEXT)
`find-products` props:
  field★(STATIC_DROPDOWN)='name' ["Name"|"Product Code"]
  fieldValue★(SHORT_TEXT)
`find-notes` props:
  objectType★(STATIC_DROPDOWN) ["Deal"|"Lead"|"Person"|"Organization"]
  objectId★(SHORT_TEXT)
`get-product` props:
  productId★(NUMBER)
`find-organization` props:
  searchField★(DROPDOWN)
  searchFieldValue★(DYNAMIC)
`find-person` props:
  searchField★(DROPDOWN)
  searchFieldValue★(DYNAMIC)
`find-deal` props:
  searchField★(DROPDOWN)
  searchFieldValue★(DYNAMIC)
`find-activity` props:
  subject★(SHORT_TEXT)
  exactMatch(CHECKBOX)=true
  assignTo(DROPDOWN)
  type(DROPDOWN)
  filterId(DROPDOWN)
  status(STATIC_DROPDOWN) ["Done"|"Not Done"]
`find-user` props:
  field★(STATIC_DROPDOWN) ["Name"|"Email"]
  fieldValue★(SHORT_TEXT)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### zoho-crm  v2.0.0 | OAuth2
*Customer relationship management software*
**Triggers:** `new_contact` `new_lead` `new_module_entry` `new_or_updated_contact` `new_or_updated_lead` `new_or_updated_module_entry` `new_user` `updated_module_entry`
**Actions:** `read-file` `add_attachment` `add_tag` `convert_lead` `create_module_entry` `update_module_entry` `update_related_module_entry` `create_update_module_entry` `find_module_entry` `find_module_entries` `custom_api_call`
`new_contact` props:
  triggerConfig(STATIC_DROPDOWN)='all_contacts' ["All New Contacts"] //Configuration for the trigger
  lookbackHours(NUMBER)=72 //How many hours back to check for new contacts (default: 72 f
  debugMode(CHECKBOX)=true //Enable detailed logging for troubleshooting
`new_lead` props:
  triggerConfig(STATIC_DROPDOWN)='all_leads' ["All New Leads"] //Configuration for the trigger
  lookbackHours(NUMBER)=72 //How many hours back to check for new leads (default: 72 for 
  debugMode(CHECKBOX)=true //Enable detailed logging for troubleshooting
`new_module_entry` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to monitor
  lookbackHours(NUMBER)=72 //How many hours back to check for new entries (default: 72 fo
  debugMode(CHECKBOX)=true //Enable detailed logging for troubleshooting
`new_or_updated_contact` props:
  triggerConfig(STATIC_DROPDOWN)='all_changes' ["All New or Updated Contacts"] //Configuration for the trigger
  lookbackHours(NUMBER)=72 //How many hours back to check for new or updated contacts (de
  debugMode(CHECKBOX)=true //Enable detailed logging for troubleshooting
`new_or_updated_lead` props:
  triggerConfig(STATIC_DROPDOWN)='all_changes' ["All New or Updated Leads"] //Configuration for the trigger
  lookbackHours(NUMBER)=72 //How many hours back to check for new or updated leads (defau
  debugMode(CHECKBOX)=true //Enable detailed logging for troubleshooting
`new_or_updated_module_entry` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to monitor
`new_user` props:
  triggerConfig(STATIC_DROPDOWN)='all_users' ["All New Users"] //Configuration for the trigger
  lookbackHours(NUMBER)=72 //How many hours back to check for new users (default: 72 for 
  debugMode(CHECKBOX)=true //Enable detailed logging for troubleshooting
`updated_module_entry` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to monitor
`read-file` props:
  url★(SHORT_TEXT) //The full URL to use, including the base URL
`add_attachment` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module
  recordId★(DROPDOWN) //Select the record to attach the file to
  file★(FILE) //The file to attach
  attachmentName(SHORT_TEXT) //Name for the attachment (optional, defaults to file name)
`add_tag` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module
  recordId★(DROPDOWN) //Select the record to add the tag to
  tagName★(SHORT_TEXT) //The name of the tag to add
`convert_lead` props:
  leadId★(DROPDOWN) //Select the lead to convert
  createContact(CHECKBOX)=true //Whether to create a contact from the lead
  contactData(JSON) //Additional contact data as JSON (optional). Example: {"Depar
  createAccount(CHECKBOX)=true //Whether to create an account from the lead
  accountData(JSON) //Additional account data as JSON (optional). Example: {"Indus
  createDeal(CHECKBOX)=false //Whether to create a deal from the lead
  dealData(JSON) //Additional deal data as JSON (optional). Example: {"Deal_Nam
  assignToOwner(CHECKBOX)=true //Assign the new records to the original lead owner
  skipAccountOnError(CHECKBOX)=false //If account creation fails, continue with contact/deal creati
`create_module_entry` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to create an entry in
  data★(JSON) //The data for the entry as JSON. Example: {"First_Name": "Joh
  triggerWorkflow(CHECKBOX)=true //Whether to trigger workflow rules after creating the entry
  triggerApproval(CHECKBOX)=false //Whether to trigger approval process after creating the entry
  triggerBlueprint(CHECKBOX)=false //Whether to trigger blueprint after creating the entry
`update_module_entry` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to update an entry in
  recordId★(DROPDOWN) //Select the record to update
  data★(JSON) //The data to update the entry with as JSON. Only include fiel
  triggerWorkflow(CHECKBOX)=true //Whether to trigger workflow rules after updating the entry
  triggerApproval(CHECKBOX)=false //Whether to trigger approval process after updating the entry
  triggerBlueprint(CHECKBOX)=false //Whether to trigger blueprint after updating the entry
  overwrite(CHECKBOX)=false //Whether to overwrite existing fields with empty values from 
`update_related_module_entry` props:
  sourceModule★(STATIC_DROPDOWN) //The module containing the source record
  sourceRecordId★(DROPDOWN) //Select the source record
  relatedModule★(STATIC_DROPDOWN) //The module containing the related record to update
  relationshipType★(STATIC_DROPDOWN) //Choose the type of relationship to find the related record
  relationshipField(SHORT_TEXT) //The field name that links the source record to the related r
  updateData★(JSON) //The data to update the related entry with as JSON. Example: 
  triggerWorkflow(CHECKBOX)=true //Whether to trigger workflow rules after updating the related
  triggerApproval(CHECKBOX)=false //Whether to trigger approval process after updating the relat
  triggerBlueprint(CHECKBOX)=false //Whether to trigger blueprint after updating the related entr
`create_update_module_entry` props:
  operation★(STATIC_DROPDOWN)='create' ["Create New Record"|"Update Existing Record"] //Choose whether to create a new record or update an existing 
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to create or update an entry in
  recordId(DROPDOWN) //Select the record to update
  data★(JSON) //The data for the entry as JSON. Example: {"First_Name": "Joh
  triggerWorkflow(CHECKBOX)=true //Whether to trigger workflow rules after creating/updating th
  triggerApproval(CHECKBOX)=false //Whether to trigger approval process after creating/updating 
  triggerBlueprint(CHECKBOX)=false //Whether to trigger blueprint after creating/updating the ent
`find_module_entry` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to search in
  searchType★(STATIC_DROPDOWN) //Choose how to search for the entry
  searchValue★(SHORT_TEXT) //The value to search for (ID, email, phone, name, company, et
  searchField(SHORT_TEXT) //The field name to search in (only required for custom field 
  searchOperator(STATIC_DROPDOWN)='equals' ["Equals (exact match)"|"Contains (partial match)"|"Starts with"|"Ends with"|"Greater than"|"Less than"|"Not equal"] //How to match the custom field value
  fields(LONG_TEXT) //Comma-separated list of fields to return. Leave empty for al
  limit(NUMBER)=20 //Maximum number of results to return (default: 20, max: 200)
  returnFirst(CHECKBOX)=false //If multiple results found, return only the first one as a si
`find_module_entries` props:
  module★(STATIC_DROPDOWN) //Select the Zoho CRM module to search in
  searchType(STATIC_DROPDOWN)='all' //Choose the type of search to perform
  searchValue(SHORT_TEXT) //The value to search for (used with Simple Text Search, Email
  searchCriteria(LONG_TEXT) //Advanced search criteria in Zoho CRM format. Examples: - (Em
  recentDays(NUMBER)=7 //Number of days to look back for recent records (used with Re
  dateFrom(DATE_TIME) //Start date for date range filter (used with Date Range Filte
  dateTo(DATE_TIME) //End date for date range filter (used with Date Range Filter)
  dateField(STATIC_DROPDOWN)='Modified_Time' ["Modified Time"|"Created Time"|"Last Activity Time"] //Which date field to filter by (used with Date Range Filter)
  fields(LONG_TEXT) //Comma-separated list of fields to return. Leave empty for al
  sortBy(SHORT_TEXT)='Modified_Time' //Field name to sort by (e.g., "Created_Time", "Modified_Time"
  sortOrder(STATIC_DROPDOWN)='desc' ["Ascending (A-Z, Oldest first)"|"Descending (Z-A, Newest first)"] //Sort order for the results
  page(NUMBER)=1 //Page number for pagination (default: 1)
  perPage(NUMBER)=50 //Number of records per page (default: 50, max: 200)
  modifiedSince(DATE_TIME) //Only return records modified since this date/time
  createdSince(DATE_TIME) //Only return records created since this date/time
  includeChild(CHECKBOX)=false //Include child records in the response
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### attio  v2.0.0 | API Key
*Modern, collaborative CRM platform built to be fully customizable and real-time.*
**Triggers:** `record_created` `record_updated` `list_entry_created` `list_entry_updated`
**Actions:** `create_record` `update_record` `find_record` `create_entry` `update_entry` `find_list_entry` `custom_api_call`
`record_created` props:
  objectTypeId★(DROPDOWN)
`record_updated` props:
  objectTypeId★(DROPDOWN)
`list_entry_created` props:
  listId★(DROPDOWN)
`list_entry_updated` props:
  listId★(DROPDOWN)
`create_record` props:
  objectTypeId★(DROPDOWN)
  attributes(DYNAMIC)
`update_record` props:
  objectTypeId★(DROPDOWN)
  recordId★(SHORT_TEXT) //The unique identifier of the record to update.
  attributes(DYNAMIC)
`find_record` props:
  objectTypeId★(DROPDOWN)
  attributes(DYNAMIC)
`create_entry` props:
  listId★(DROPDOWN)
  parentObjectId★(DROPDOWN)
  parentRecordId★(SHORT_TEXT)
  attributes(DYNAMIC)
`update_entry` props:
  listId★(DROPDOWN)
  entryId★(SHORT_TEXT) //The unique identifier of the entry to update.
  attributes(DYNAMIC)
`find_list_entry` props:
  listId★(DROPDOWN)
  attributes(DYNAMIC)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### intercom  v2.0.0 | OAuth2
*Customer messaging platform for sales, marketing, and support*
**Triggers:** `contactReplied` `lead-added-email` `lead-converted-to-user` `conversationClosed` `conversationAssigned` `conversationSnoozed` `conversationUnsnoozed` `new-company` `newConversationFromUser` `conversationRated` `new-lead` `new-ticket` `new-user` `conversationPartTagged` `tag-added-to-lead` `tag-added-to-user` `contact-updated` `replyFromUser` `replyFromAdmin` `noteAddedToConversation`
**Actions:** `add-note-to-user` `addNoteToConversation` `add-or-remove-tag-on-contact` `add-or-remove-tag-on-company` `add-or-remove-tag-on-conversation` `create-article` `create-conversation` `create-ticket` `create-user` `create-or-update-lead` `create-or-update-user` `replyToConversation` `send_message` `update-ticket` `find-company` `find-conversation` `find-lead` `find-user` `list-all-tags` `get-conversation` `custom_api_call`
`conversationPartTagged` props:
  tagId(DROPDOWN)
`tag-added-to-lead` props:
  tagId(DROPDOWN)
`tag-added-to-user` props:
  tagId(DROPDOWN)
`contact-updated` props:
  type★(STATIC_DROPDOWN)='user' ["User"|"Lead"]
`noteAddedToConversation` props:
  keyword(SHORT_TEXT)
`add-note-to-user` props:
  email★(SHORT_TEXT)
  body★(LONG_TEXT)
`addNoteToConversation` props:
  from★(DROPDOWN)
  conversationId★(DROPDOWN)
  body★(SHORT_TEXT)
`add-or-remove-tag-on-contact` props:
  contactId★(DROPDOWN)
  tagId★(DROPDOWN)
  untag(CHECKBOX)=false
`add-or-remove-tag-on-company` props:
  companyId★(DROPDOWN)
  tagName★(SHORT_TEXT)
  untag(CHECKBOX)=false
`add-or-remove-tag-on-conversation` props:
  conversationId★(DROPDOWN)
  tagId★(DROPDOWN)
  untag(CHECKBOX)=false
`create-article` props:
  title★(LONG_TEXT)
  description(SHORT_TEXT)
  body(LONG_TEXT)
  authorId★(DROPDOWN)
  state★(STATIC_DROPDOWN)='draft' ["Draft"|"Published"]
  collectionId(DROPDOWN)
`create-conversation` props:
  contactType★(STATIC_DROPDOWN)='user' ["User"|"Lead"]
  contactId★(DROPDOWN)
  body★(LONG_TEXT)
`create-ticket` props:
  ticketTypeId★(DROPDOWN)
  contactId★(DROPDOWN)
  companyId(DROPDOWN)
  ticketProperties★(DYNAMIC)
`create-user` props:
  email★(SHORT_TEXT)
  createdAt(DATE_TIME)
  userId(SHORT_TEXT)
  name(SHORT_TEXT)
  customAttributes(OBJECT)
`create-or-update-lead` props:
  leadId(SHORT_TEXT)
  name(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  unsubscribe(CHECKBOX)
  createdAt(DATE_TIME)
  customAttributes(OBJECT)
`create-or-update-user` props:
  email★(SHORT_TEXT)
  name(SHORT_TEXT)
  userId(SHORT_TEXT)
  phone(SHORT_TEXT)
  createdAt(DATE_TIME)
  customAttributes(OBJECT)
`replyToConversation` props:
  from★(DROPDOWN)
  conversationId★(DROPDOWN)
  body★(SHORT_TEXT)
`send_message` props:
  message_type★(STATIC_DROPDOWN)='email' ["Email"|"In App Chat"]
  email_required_fields★(DYNAMIC)
  from★(DROPDOWN)
  to★(DROPDOWN)
  body★(SHORT_TEXT)
  create_conversation_without_contact_reply(CHECKBOX)=false //Whether a conversation should be opened in the inbox for the
`update-ticket` props:
  ticketTypeId★(DROPDOWN)
  ticketId★(DROPDOWN)
  ticketProperties★(DYNAMIC)
  isOpen(CHECKBOX)
  state(STATIC_DROPDOWN) ["In Progress"|"Waiting on Customer"|"Resolved"]
  snoozedTill(DATE_TIME)
  assignedAdminId(DROPDOWN)
`find-company` props:
  searchField★(STATIC_DROPDOWN) ["Name"|"Company ID"]
  searchValue★(SHORT_TEXT)
`find-conversation` props:
  searchField★(STATIC_DROPDOWN) ["Conversation ID"|"Subject"|"Message Body"|"Author Email"|"Assigned Admin"|"Team"|"Tag IDs"]
  matchType★(STATIC_DROPDOWN) ["Contains"|"Equals"|"Starts With"]
  searchTerm★(SHORT_TEXT)
  status(STATIC_DROPDOWN) ["Open"|"Closed"]
  updateAfter(DATE_TIME)
  updateBefore(DATE_TIME)
`find-lead` props:
  searchField★(STATIC_DROPDOWN) ["Email"|"ID"|"User ID"]
  searchValue★(SHORT_TEXT)
`find-user` props:
  searchField★(STATIC_DROPDOWN) ["Email"|"ID"|"User ID"]
  searchValue★(SHORT_TEXT)
`get-conversation` props:
  conversationId★(DROPDOWN)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### activecampaign  v2.0.0 | Custom(apiUrl,apiKey)
*Email marketing, marketing automation, and CRM tools you need to create incredible customer experien*
**Triggers:** `activecampaign_deal_task_completed` `activecampaign_new_contact_note` `activecampaign_new_contact_task` `activecampaign_new_deal_added_or_updated` `activecampaign_new_or_updated_account` `activecampaign_new_deal_note` `activecampaign_new_deal_task` `activecampaign_new_tag_added_or_removed_from_contact` `activecampaign_updated_contact`
**Actions:** `activecampaign_add_contact_to_account` `activecampaign_add_tag_to_contact` `activecampaign_create_account` `activecampaign_create_contact` `activecampaign_update_account` `activecampaign_update_contact` `activecampaign_subscribe_or_unsubscribe_contact_from_list`
`activecampaign_add_contact_to_account` props:
  contactId★(DROPDOWN)
  accountId★(DROPDOWN)
  jobTitle(SHORT_TEXT)
`activecampaign_add_tag_to_contact` props:
  contactId★(DROPDOWN)
  tagId★(DROPDOWN)
`activecampaign_create_account` props:
  name★(SHORT_TEXT)
  accountUrl(SHORT_TEXT)
  accountCustomFields★(DYNAMIC)
`activecampaign_create_contact` props:
  email★(SHORT_TEXT)
  firstName(SHORT_TEXT)
  lastName(SHORT_TEXT)
  phone(SHORT_TEXT)
  contactCustomFields★(DYNAMIC)
`activecampaign_update_account` props:
  accountId★(DROPDOWN)
  name(SHORT_TEXT)
  accountUrl(SHORT_TEXT)
  accountCustomFields★(DYNAMIC)
`activecampaign_update_contact` props:
  contactId★(DROPDOWN)
  email(SHORT_TEXT)
  firstName(SHORT_TEXT)
  lastName(SHORT_TEXT)
  phone(SHORT_TEXT)
  contactCustomFields★(DYNAMIC)
`activecampaign_subscribe_or_unsubscribe_contact_from_list` props:
  listId★(DROPDOWN)
  status★(STATIC_DROPDOWN) ["Subscribe"|"Unsubscribe"]
  contactId★(SHORT_TEXT)

### copper  v2.0.0 | Custom(email,apiKey)
*Manage your CRM data with Copper. Automate lead tracking, contact management, opportunities, and tas*
**Triggers:** `newActivity` `newPerson` `newLead` `newTask` `updatedLead` `updatedTask` `updatedOpportunity` `updatedOpportunityStage` `updatedOpportunityStatus` `updatedProject` `updatedLeadStatus`
**Actions:** `createPerson` `updatePerson` `createLead` `updateLead` `convertLead` `createCompany` `updateCompany` `createOpportunity` `updateOpportunity` `createProject` `updateProject` `createTask` `createActivity` `searchForAnActivity` `searchForAPerson` `searchForALead` `searchForACompany` `searchForAnOpportunity` `searchForAProject` `custom_api_call`
`createPerson` props:
  name★(SHORT_TEXT)
  emails★(ARRAY)
  phone_numbers(ARRAY)
  address_street(SHORT_TEXT)
  address_city(SHORT_TEXT)
  address_state(SHORT_TEXT)
  address_postal_code(SHORT_TEXT)
  address_country(SHORT_TEXT)
`updatePerson` props:
  personId★(DROPDOWN) //select a person
  fields(DYNAMIC)
`createLead` props:
  name★(SHORT_TEXT)
  email★(SHORT_TEXT)
  category★(SHORT_TEXT)
  phone_numbers(ARRAY)
  address_street(SHORT_TEXT)
  address_city(SHORT_TEXT)
  address_state(SHORT_TEXT)
  address_postal_code(SHORT_TEXT)
  address_country(SHORT_TEXT)
`updateLead` props:
  leadId★(DROPDOWN) //select a Lead
  fields(DYNAMIC)
`convertLead` props:
  leadId★(DROPDOWN) //select a Lead
  companyId(DROPDOWN) //select a Company
  opportunityId(DROPDOWN) //select an Opportunity
`createCompany` props:
  name★(SHORT_TEXT)
  email_domain(SHORT_TEXT) //E.g. democompany.com
  details(SHORT_TEXT)
  phone_numbers(ARRAY)
  address_street(SHORT_TEXT)
  address_city(SHORT_TEXT)
  address_state(SHORT_TEXT)
  address_postal_code(SHORT_TEXT)
  address_country(SHORT_TEXT)
  primaryContactId(DROPDOWN) //select a primary contact
`updateCompany` props:
  companyId★(DROPDOWN) //select a Company
  fields(DYNAMIC)
  primaryContactId(DROPDOWN) //select a primary contact
`createOpportunity` props:
  name★(SHORT_TEXT) //The name of the opportunity
  pipelineId(DROPDOWN) //select a Pipeline
  pipelineStageId(DROPDOWN) //Select a stage
  primaryContactId(DROPDOWN) //select a primary contact
`updateOpportunity` props:
  opportunityId★(DROPDOWN) //select an Opportunity
  updateFields(DYNAMIC)
  pipelineId(DROPDOWN) //select a Pipeline
  pipelineStageId(DROPDOWN) //Select a stage
  primaryContactId(DROPDOWN) //select a primary contact
`createProject` props:
  name★(SHORT_TEXT) //The name of the project
  details(SHORT_TEXT) //The details of the project
`updateProject` props:
  projectId★(DROPDOWN) //select a Project
  updateFields(DYNAMIC)
`createTask` props:
  name★(SHORT_TEXT)
  details(SHORT_TEXT) //Details fo this task
  custom_activity_type_id★(DROPDOWN) //Select activity Type
  assigneeId(DROPDOWN) //select a user to assign to
  entity(STATIC_DROPDOWN) ["Person"|"Company"|"Lead"|"Opportunity"|"Project"] //Choose the type of Copper record this task should be linked 
  entityItemId(DROPDOWN) //Select the specific record (from the chosen type above) that
  due_date(DATE_TIME) //Enter date and time in 24-hour format, e.g. `2025-09-09 11:4
  reminder_date(DATE_TIME) //Enter date and time in 24-hour format, e.g. `2025-09-09 11:4
  priority(STATIC_DROPDOWN) ["None"|"Low"|"Medium"|"High"]
  tags(ARRAY)
`createActivity` props:
  entity★(STATIC_DROPDOWN) ["Person"|"Company"|"Lead"|"Opportunity"|"Project"|"Task"] //Select parent entity
  entityItemId★(DROPDOWN) //Select Resource
  details(SHORT_TEXT) //The details of the project
  type★(DROPDOWN) //Select activity Type
`searchForAnActivity` props:
  entity(STATIC_DROPDOWN) ["Person"|"Company"|"Lead"|"Opportunity"|"Project"|"Task"] //Select parent entity
  entityItemId(DROPDOWN) //Select Resource
  activity_types(MULTI_SELECT_DROPDOWN) //Select activity Type
  page_size(NUMBER)=50 //Default 50. Max 200.
  page_number(NUMBER)=1
  minimum_activity_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 11:40. The timestamp of the 
  maximum_activity_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  full_result(CHECKBOX)=false //(Optional) If set, search performance improves but duplicate
`searchForAPerson` props:
  name(SHORT_TEXT) //Full name of the People to search for.
  phone_number(SHORT_TEXT) //Phone Number of the People to search for.
  emails(ARRAY) //Emails of the People to search for.
  contact_type_ids(MULTI_SELECT_DROPDOWN) //Select contact Type
  assignee_ids(MULTI_SELECT_DROPDOWN) //select assignees
  company_ids(MULTI_SELECT_DROPDOWN) //select Companies
  opportunity_ids(MULTI_SELECT_DROPDOWN) //select Opportunities
  city(SHORT_TEXT) //The city in which People must be located.
  state(SHORT_TEXT) //The state or province in which People must be located.
  postal_code(SHORT_TEXT) //The postal code in which People must be located.
  country(SHORT_TEXT) //The two character country code where People must be located.
  tags(ARRAY) //Filter People to those that match at least one of the tags s
  socials(ARRAY) //Filter People to those that match at least one of the social
  followed(STATIC_DROPDOWN) ["followed"|"not followed"] //Filter by followed state
  age(NUMBER) //The maximum age in seconds that People must be.
  page_size(NUMBER)=50 //Default 50. Max 200.
  page_number(NUMBER)=1
  sort_by(STATIC_DROPDOWN) //The field on which to sort the results
  sort_direction(STATIC_DROPDOWN) ["Ascending"|"Descending"] //The direction in which to sort the result
  minimum_interaction_count(NUMBER) //The minimum number of interactions People must have had.
  maximum_interaction_count(NUMBER) //The maximum number of interactions People must have had.
  minimum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
`searchForALead` props:
  name(SHORT_TEXT) //Full name of the Lead to search for.
  phone_number(SHORT_TEXT) //Phone Number of the Lead to search for.
  emails(SHORT_TEXT) //Emails of the Lead to search for.
  assignee_ids(MULTI_SELECT_DROPDOWN) //select assignees
  status_ids(MULTI_SELECT_DROPDOWN) //Select lead status
  customer_source_ids(MULTI_SELECT_DROPDOWN) //Select customer source.
  city(SHORT_TEXT) //The city in which Lead must be located.
  state(SHORT_TEXT) //The state or province in which Lead must be located.
  postal_code(SHORT_TEXT) //The postal code in which Lead must be located.
  country(SHORT_TEXT) //The two character country code where Lead must be located.
  tags(ARRAY) //Filter Lead to those that match at least one of the tags spe
  socials(ARRAY) //Filter Lead to those that match at least one of the social a
  followed(STATIC_DROPDOWN) ["followed"|"not followed"] //Filter by followed state
  age(NUMBER) //The maximum age in seconds that Lead must be.
  page_size(NUMBER)=50 //Default 50. Max 200.
  page_number(NUMBER)=1
  sort_by(STATIC_DROPDOWN) //The field on which to sort the results
  sort_direction(STATIC_DROPDOWN) ["Ascending"|"Descending"] //The direction in which to sort the result
  include_converted_leads(CHECKBOX)=false //Specify if response should contain converted leads.
  minimum_monetary_value(NUMBER) //The minimum monetary value Leads must have.
  maximum_monetary_value(NUMBER) //The maximum monetary value Leads must have.
  minimum_interaction_count(NUMBER) //The minimum number of interactions Lead must have had.
  maximum_interaction_count(NUMBER) //The maximum number of interactions Lead must have had.
  minimum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_modified_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_modified_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
`searchForACompany` props:
  name(SHORT_TEXT) //Full name of the Company to search for.
  phone_number(SHORT_TEXT) //Phone Number of the Company to search for.
  email_domains(SHORT_TEXT) //Email Domain of the Company to search for.
  contact_type_ids(MULTI_SELECT_DROPDOWN) //Select contact Type
  assignee_ids(MULTI_SELECT_DROPDOWN) //select assignees
  city(SHORT_TEXT) //The city in which Company must be located.
  state(SHORT_TEXT) //The state or province in which Company must be located.
  postal_code(SHORT_TEXT) //The postal code in which Company must be located.
  country(SHORT_TEXT) //The two character country code where Company must be located
  tags(ARRAY) //Filter Company to those that match at least one of the tags 
  socials(ARRAY) //Filter Company to those that match at least one of the socia
  followed(STATIC_DROPDOWN) ["followed"|"not followed"] //Filter by followed state
  age(NUMBER) //The maximum age in seconds that Company must be.
  page_size(NUMBER)=50 //Default 50. Max 200.
  page_number(NUMBER)=1
  sort_by(STATIC_DROPDOWN) //The field on which to sort the results
  sort_direction(STATIC_DROPDOWN) ["Ascending"|"Descending"] //The direction in which to sort the result
  minimum_interaction_count(NUMBER) //The minimum number of interactions Company must have had.
  maximum_interaction_count(NUMBER) //The maximum number of interactions Company must have had.
  minimum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
`searchForAnOpportunity` props:
  name(SHORT_TEXT) //Full name of the Opportunity to search for.
  assignee_ids(MULTI_SELECT_DROPDOWN) //select assignees
  company_ids(MULTI_SELECT_DROPDOWN) //select Companies
  status_ids(STATIC_MULTI_SELECT_DROPDOWN) ["Open"|"Won"|"Lost"|"Abandoned"] //Filter by Opportunity status
  priorities(STATIC_MULTI_SELECT_DROPDOWN) ["None"|"Low"|"Medium"|"High"]
  pipeline_ids(MULTI_SELECT_DROPDOWN) //select a Pipeline
  pipeline_stage_ids(MULTI_SELECT_DROPDOWN) //Select a stage
  primary_contact_ids(MULTI_SELECT_DROPDOWN) //select primary contacts
  customer_source_ids(MULTI_SELECT_DROPDOWN) //Select customer source.
  loss_reason_ids(MULTI_SELECT_DROPDOWN) //Select loss reason.
  tags(ARRAY) //Filter People to those that match at least one of the tags s
  followed(STATIC_DROPDOWN) ["followed"|"not followed"] //Filter by followed state
  page_size(NUMBER)=50 //Default 50. Max 200.
  page_number(NUMBER)=1
  sort_by(STATIC_DROPDOWN) //The field on which to sort the results
  sort_direction(STATIC_DROPDOWN) ["Ascending"|"Descending"] //The direction in which to sort the result
  minimum_monetary_value(NUMBER) //The minimum monetary value Opportunities must have.
  maximum_monetary_value(NUMBER) //The maximum monetary value Opportunities must have.
  minimum_interaction_count(NUMBER) //The minimum number of interactions Opportunity must have had
  maximum_interaction_count(NUMBER) //The maximum number of interactions Opportunity must have had
  minimum_close_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_close_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_interaction_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_stage_change_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_stage_change_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_modified_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_modified_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
`searchForAProject` props:
  name(SHORT_TEXT) //Full name of the Opportunity to search for.
  assignee_ids(MULTI_SELECT_DROPDOWN) //select assignees
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["Open"|"Completed"] //Filter by Opportunity status
  tags(ARRAY) //Filter People to those that match at least one of the tags s
  followed(STATIC_DROPDOWN) ["followed"|"not followed"] //Filter by followed state
  page_size(NUMBER)=50 //Default 50. Max 200.
  page_number(NUMBER)=1
  sort_by(STATIC_DROPDOWN) ["Name"|"Assigned To"|"Related To"|"Status"|"Date Modified"|"Date Created"] //The field on which to sort the results
  sort_direction(STATIC_DROPDOWN) ["Ascending"|"Descending"] //The direction in which to sort the result
  minimum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_created_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  minimum_modified_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
  maximum_modified_date(DATE_TIME) //24-hour format, e.g. 2025-09-10 13:00. The timestamp of the 
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### freshsales  v2.0.0 | Basic Auth
*Sales CRM software*
**Actions:** `freshsales_create_contact` `custom_api_call`

### lead-connector  v2.0.0 | OAuth2
*Lead Connector - Go High Level*
**Triggers:** `new_contact` `contact_updated` `new_form_submission` `new_opportunity`
**Actions:** `create_contact` `update_contact` `add_contact_to_campaign` `add_contact_to_workflow` `add_note_to_contact` `search_contacts` `create_opportunity` `update_opportunity` `create_task` `update_task` `custom_api_call`
`new_form_submission` props:
  form★(DROPDOWN) //The form you want to use.
`new_opportunity` props:
  pipeline★(DROPDOWN) //The ID of the pipeline to use.
`create_contact` props:
  firstName(SHORT_TEXT)
  lastName(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  companyName(SHORT_TEXT)
  website(SHORT_TEXT)
  tags(MULTI_SELECT_DROPDOWN)
  source(SHORT_TEXT)
  country(DROPDOWN) //When using a dynamic value, make sure to use the ISO-2 count
  city(SHORT_TEXT)
  state(SHORT_TEXT)
  address(LONG_TEXT)
  postalCode(SHORT_TEXT)
  timezone(DROPDOWN)
`update_contact` props:
  id★(SHORT_TEXT) //The ID of the contact.
  firstName(SHORT_TEXT)
  lastName(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  companyName(SHORT_TEXT)
  website(SHORT_TEXT)
  tags(MULTI_SELECT_DROPDOWN)
  source(SHORT_TEXT)
  country(DROPDOWN) //When using a dynamic value, make sure to use the ISO-2 count
  city(SHORT_TEXT)
  state(SHORT_TEXT)
  address(LONG_TEXT)
  postalCode(SHORT_TEXT)
  timezone(DROPDOWN)
`add_contact_to_campaign` props:
  contact★(DROPDOWN) //The contact to use.
  campaign★(DROPDOWN)
`add_contact_to_workflow` props:
  contact★(DROPDOWN) //The contact to use.
  workflow★(DROPDOWN)
`add_note_to_contact` props:
  contact★(DROPDOWN) //The contact to use.
  note★(SHORT_TEXT)
  user★(DROPDOWN)
`search_contacts` props:
  query★(SHORT_TEXT) //The value you want to search for.
`create_opportunity` props:
  pipeline★(DROPDOWN) //The ID of the pipeline to use.
  stage★(DROPDOWN) //The stage of the pipeline to use.
  title★(SHORT_TEXT)
  contact★(DROPDOWN) //The contact to use.
  status★(DROPDOWN)
  assignedTo(DROPDOWN)
  monetaryValue(NUMBER)
`update_opportunity` props:
  pipeline★(DROPDOWN) //The ID of the pipeline to use.
  opportunity★(DROPDOWN)
  stage(DROPDOWN) //The stage of the pipeline to use.
  title(SHORT_TEXT)
  contact(DROPDOWN) //The contact to use.
  status(DROPDOWN)
  assignedTo(DROPDOWN)
  monetaryValue(NUMBER)
`create_task` props:
  contact★(DROPDOWN) //The contact to use.
  title★(SHORT_TEXT)
  dueDate★(DATE_TIME)
  description(SHORT_TEXT)
  assignedTo(DROPDOWN)
  completed★(CHECKBOX)=false
`update_task` props:
  contact★(DROPDOWN) //The contact to use.
  task★(DROPDOWN)
  title(SHORT_TEXT)
  dueDate(DATE_TIME)
  description(SHORT_TEXT)
  assignedTo(DROPDOWN)
  completed(CHECKBOX)=false
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### bigin-by-zoho  v2.0.0 | OAuth2
*Bigin by Zoho CRM is a lightweight CRM designed for small businesses to manage contacts, companies, *
**Triggers:** `newContactCreated` `contactUpdated` `newCompanyCreated` `companyUpdated` `newCallCreated` `newTaskCreated` `newEventCreated` `newPipelineRecordCreated` `pipelineRecordUpdated`
**Actions:** `createCompany` `updateCompany` `createContact` `updateContact` `createTask` `updateTask` `createCall` `createEvent` `updateEvent` `createPipeline` `updatePipeline` `searchPipelineRecord` `searchCompanyRecord` `searchContactRecord` `searchProductRecord` `searchUser`
`createCompany` props:
  accountName★(SHORT_TEXT) //Provide the name of the company
  phone(SHORT_TEXT) //Provide a phone number for the company
  website(SHORT_TEXT) //Provide a website URL for the company
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Accounts".
  description(LONG_TEXT) //Provide additional descriptions or notes related to the comp
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  billingStreet(SHORT_TEXT) //The street address of the company
  billingCity(SHORT_TEXT) //The city where the company is located
  billingState(SHORT_TEXT) //The state or province where the company is located
  billingCountry(SHORT_TEXT) //The country of the company
  billingCode(SHORT_TEXT) //The ZIP or postal code of the company
`updateCompany` props:
  companyId★(DROPDOWN) //Choose a company to update
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  companyDetails★(DYNAMIC) //These fields will be prepopulated with company data
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Accounts".
`createContact` props:
  firstName(SHORT_TEXT) //First name of the contact
  lastName★(SHORT_TEXT) //Last name of the contact
  title(SHORT_TEXT) //Job title of the contact
  email(SHORT_TEXT) //Email address of the contact
  mobile(SHORT_TEXT) //Mobile phone number
  emailOptOut(CHECKBOX)=false //Whether the contact has opted out of emails
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  accountName(DROPDOWN) //The ID of the company to which the record will be associated
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Contacts".
  description(LONG_TEXT) //Provide additional descriptions or notes related to the cont
  mailingStreet(SHORT_TEXT) //Street address for mailing
  mailingCity(SHORT_TEXT) //City for mailing address
  mailingState(SHORT_TEXT) //State for mailing address
  mailingCountry(SHORT_TEXT) //Country for mailing address
  mailingZip(SHORT_TEXT) //ZIP/postal code
`updateContact` props:
  contactId★(DROPDOWN) //Choose a contact to update
  contactDetails★(DYNAMIC) //Edit any of these fields
  accountName(DROPDOWN) //The ID of the company to which the record will be associated
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Contacts".
`createTask` props:
  subject★(SHORT_TEXT) //Provide the subject or title of the task
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  dueDate(DATE_TIME) //Provide the due date of the task (YYYY-MM-DD format)
  enableRecurring(CHECKBOX) //make this task recurring
  recurringInfo(DYNAMIC) //Please note: Due Date must be set above for recurring tasks
  enableReminder(CHECKBOX) //Enable reminder for this task
  reminderInfo(DYNAMIC)
  relatedModule(STATIC_DROPDOWN)='Contacts' ["Contacts"|"Pipelines"|"Companies"] //Select the type of entity the task is related to. Options: C
  relatedTo(DROPDOWN) //Select the specific record the task is related to.
  description(LONG_TEXT) //Provide additional descriptions or notes related to the task
  priority(STATIC_DROPDOWN) ["High"|"Normal"|"Low"|"Lowest"|"Highest"] //Provide the priority level of the task
  status(STATIC_DROPDOWN) ["In Progress"|"Completed"|"Deferred"|"Waiting for input"|"Not Started"] //Provide the current status of the task.
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Tasks".
`updateTask` props:
  taskId★(DROPDOWN) //Choose a task to update
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  taskDetails★(DYNAMIC) //These fields will be prepopulated with task data
  enableRecurring(CHECKBOX) //make this task recurring
  recurringInfo(DYNAMIC) //Please note: Due Date must be set above for recurring tasks
  enableReminder(CHECKBOX) //Enable reminder for this task
  reminderInfo(DYNAMIC)
  relatedModule(DROPDOWN)='Contacts' //Select the type of entity the task is related to. Options: C
  relatedTo(DROPDOWN) //Select the specific record the task is related to.
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Tasks".
`createCall` props:
  callStartTime★(DATE_TIME) //Provide the start time of the call in ISO8601 format.
  callDuration★(NUMBER) //Provide the duration of the call in minutes (numeric). For e
  callType★(STATIC_DROPDOWN) ["Outbound"|"Inbound"|"Missed"] //Type of call
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  contactName(DROPDOWN) //The ID of the contact to which the record will be associated
  subject(SHORT_TEXT) //Subject of the call
  description(LONG_TEXT) //Description or notes about the call
  callAgenda(LONG_TEXT) //Agenda or purpose of the call
  reminder(DATE_TIME) //Reminder date and time for the call
  dialledNumber(SHORT_TEXT) //Provide the number dialed for the call.
  relatedModule(STATIC_DROPDOWN)='Pipelines' ["Pipelines"|"Companies"] //Select the type of entity the call is related to.
  relatedTo(DROPDOWN) //Select the specific record the call is related to.
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Calls".
`createEvent` props:
  eventTitle★(SHORT_TEXT) //Provide the title or name of the event
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  startDateTime★(DATE_TIME) //Start date and time of the event
  endDateTime★(DATE_TIME) //End date and time of the event
  allDay(CHECKBOX) //Mark this as an all-day event
  enableRecurring(CHECKBOX) //Make this event recurring
  recurringInfo(DYNAMIC)
  enableReminder(CHECKBOX) //Enable reminder for this event
  reminderInfo(DYNAMIC)
  venue(SHORT_TEXT) //Location or venue of the event
  relatedModule(STATIC_DROPDOWN)='Contacts' ["Contacts"|"Pipelines"|"Companies"] //Select the type of entity the event is related to
  relatedTo(DROPDOWN) //Select the specific record the event is related to
  participants(ARRAY) //Add participants to the event
  description(LONG_TEXT) //Additional descriptions or notes related to the event
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Events".
`updateEvent` props:
  eventId★(DROPDOWN) //Choose the event to update
  eventFields(DYNAMIC)
  enableRecurring(CHECKBOX) //Make this event recurring
  recurringInfo(DYNAMIC)
  enableReminder(CHECKBOX) //Enable reminder for this event
  reminderInfo(DYNAMIC)
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  relatedModule(DROPDOWN) //Select the type of entity the event is related to
  relatedTo(DROPDOWN) //Select the specific record the event is related to
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Events".
`createPipeline` props:
  dealName★(SHORT_TEXT) //Provide the name for the pipeline record (deal)
  pipeline(DROPDOWN) //Provide the Team Pipeline to which the pipeline record (deal
  subPipeline★(DROPDOWN) //Pick one of the configured sub-pipelines
  stage★(DROPDOWN) //Provide the current stage of the pipeline record (deal) with
  amount(NUMBER) //The amount of the pipeline record (deal)
  secondaryContacts(MULTI_SELECT_DROPDOWN) //Provide a list of additional contacts associated with the re
  closingDate★(DATE_TIME) //Provide the expected or actual closing date of the pipeline 
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  accountName(DROPDOWN) //The ID of the company to which the record will be associated
  contactName(DROPDOWN) //The ID of the contact to which the record will be associated
  associatedProducts(MULTI_SELECT_DROPDOWN) //Provide a list of products associated with the record
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Pipelines".
  additionalFields(DYNAMIC) //Optional fields from the Pipelines module
`updatePipeline` props:
  pipelineRecordId(DROPDOWN) //Select a pipeline record
  pipelineDetails★(DYNAMIC) //These fields will be prepopulated with pipeline data
  pipeline(DROPDOWN) //Provide the Team Pipeline to which the pipeline record (deal
  subPipeline★(DROPDOWN) //Pick one of the configured sub-pipelines
  stage★(DROPDOWN) //Provide the current stage of the pipeline record (deal) with
  owner(DROPDOWN) //Select the owner to which the record will be assigned.
  accountName(DROPDOWN) //The ID of the company to which the record will be associated
  contactName(DROPDOWN) //The ID of the contact to which the record will be associated
  secondaryContacts(MULTI_SELECT_DROPDOWN) //Provide a list of additional contacts associated with the re
  associatedProducts(MULTI_SELECT_DROPDOWN) //Provide a list of products associated with the record
  tag(MULTI_SELECT_DROPDOWN) //Select tags to associate with this module, "Pipelines".
`searchPipelineRecord` props:
  mode★(STATIC_DROPDOWN)='criteria' ["Criteria (Deal Name)"|"Word"]
  dealName★(SHORT_TEXT) //Deal Name (criteria) or word
`searchCompanyRecord` props:
  mode★(STATIC_DROPDOWN)='criteria' ["Criteria (full name)"|"Word"]
  companyName★(SHORT_TEXT) //Company full name (criteria) or word
`searchContactRecord` props:
  mode★(STATIC_DROPDOWN)='criteria' ["Criteria (name/email/mobile)"|"Email"|"Phone"|"Word"] //Choose how to search Contacts
  searchTerm★(SHORT_TEXT) //Text, email, phone, or word based on the selected mode
`searchProductRecord` props:
  mode★(STATIC_DROPDOWN)='criteria' ["Criteria (name/code)"|"Word"]
  searchTerm★(SHORT_TEXT) //Product name/code (criteria) or word
`searchUser` props:
  email★(SHORT_TEXT) //User email address (full or partial, case-insensitive match)
  type(STATIC_DROPDOWN)
  page(NUMBER) //Page index (default 1)
  per_page(NUMBER) //Records per page (max 200, default 200)

### capsule-crm  v2.0.1 | OAuth2
*Manage contacts, projects, and sales opportunities with Capsule CRM.*
**Triggers:** `new_case` `new_opportunity` `new_task` `new_project`
**Actions:** `create_contact` `update_contact` `create_opportunity` `create_project` `create_task` `update_opportunity` `add_note_to_entity` `find_contact` `find_project` `find_opportunity`

### close  v2.0.0 | API Key
*Sales automation and CRM integration for Close*
**Triggers:** `new_lead_created` `new_contact_added` `new_opportunity_added`
**Actions:** `create_lead` `create_contact` `find_lead` `create_opportunity` `find_contact` `custom_api_call`

### kommo  v2.0.0 | Custom(subdomain,apiToken)
*Automate your sales pipeline and customer communications with Kommo. Manage leads, contacts, and com*
**Triggers:** `lead_status_changed` `new_contact_added` `new_lead_created` `new_task_created`
**Actions:** `find_lead` `update_contact` `create_lead` `update_lead` `create_contact` `find_contact` `find_company` `custom_api_call`

### fireberry  v2.0.0 | API Key
*Manage records and automate CRM workflows with Fireberry. Create, update, delete, and search for rec*
**Triggers:** `record_created_or_updated`
**Actions:** `create_record` `update_record` `delete_record` `find_record`

### instantly-ai  v2.0.0 | API Key
*Powerful cold email outreach and lead engagement platform.*
**Triggers:** `campaign_status_changed` `new_lead_added`
**Actions:** `create_campaign` `create_lead_list` `add_lead_to_campaign` `search_campaigns` `search_leads` `custom_api_call`

### hunter  v2.0.0 | API Key
*Find, verify and manage professional email addresses at scale. Automate email discovery, validation,*
**Triggers:** `new-lead`
**Actions:** `add-recipients` `count-emails` `create-lead` `delete-lead` `find-email` `get-lead` `search-leads` `update-lead` `verify-email`

### apollo  v2.0.0 | API Key
*Enrich contact and company data with Apollo.io.*
**Actions:** `matchPerson` `enrichCompany`

### freshdesk  v2.0.0 | Custom(base_url,access_token)
*Customer support software*
**Actions:** `get_tickets` `get_contact_from_id` `get_ticket_status` `get_contacts` `get_all_tickets_by_status` `custom_api_call`

### crisp  v2.0.0 | Custom(identifier,token)
*Improve customer support with Crisp. Manage conversations, update contacts, add notes, and track new*
**Triggers:** `new_contact` `new_conversation`
**Actions:** `add_note` `create_conversation` `create_update_contact` `change_state` `find_conversation` `find_user_profile` `custom_api_call`
`new_contact` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
`new_conversation` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
`add_note` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
  sessionId★(SHORT_TEXT) //You can obtain session from URL address bar.It starts with '
  content★(LONG_TEXT)
`create_conversation` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
  email★(SHORT_TEXT)
  username★(SHORT_TEXT)
  messageFrom★(STATIC_DROPDOWN) ["User"|"Operator"]
  message★(LONG_TEXT)
`create_update_contact` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
  email★(SHORT_TEXT)
  name★(SHORT_TEXT)
  phone(SHORT_TEXT)
  address(LONG_TEXT)
  company(SHORT_TEXT)
  website(SHORT_TEXT)
  notepad(LONG_TEXT)
`change_state` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
  sessionId★(SHORT_TEXT) //You can obtain session from URL address bar.It starts with '
  state★(STATIC_DROPDOWN) ["Unresolved"|"Resolved"|"Pending"]
`find_conversation` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
  searchQuery★(SHORT_TEXT)
`find_user_profile` props:
  websiteId★(SHORT_TEXT) //You can obtain website ID by navigating to Settings -> Works
  email★(SHORT_TEXT) //The email address of the user to find.
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### help-scout  v2.0.0 | OAuth2
*Provide customer support with Help Scout. Manage conversations, reply to customers, add notes, and k*
**Triggers:** `conversation_created` `conversation_assigned` `new_customer` `tags_updated`
**Actions:** `create_conversation` `send_reply` `add_note` `create_customer` `update_customer_properties` `find_conversation` `find_customer` `find_user` `custom_api_call`

### zendesk  v2.0.1 | Custom(email,token,subdomain)
*Customer service software and support ticket system*
**Triggers:** `new_ticket_in_view` `new_ticket` `updated_ticket` `tag_added_to_ticket` `new_organization` `new_user` `new_suspended_ticket` `new_action_on_ticket`
**Actions:** `create-ticket` `update-ticket` `add-tag-to-ticket` `add-comment-to-ticket` `create-organization` `update-organization` `create-user` `delete-user` `find-organization` `find-tickets` `find-user` `custom_api_call`

### front  v2.0.0 | API Key
*Manage customer communications with Front. Automate messaging, contact management, conversation assi*
**Triggers:** `newComment` `newInboundMessage` `newOutboundMessage` `newTagAddedToMessage` `newConversationStateChange`
**Actions:** `addComment` `addContactHandle` `addConversationLinks` `addConversationTags` `assignUnassignConversation` `createAccount` `createContact` `createDraft` `createDraftReply` `createLink` `findAccount` `findContact` `findConversation` `removeContactHandle` `removeConversationLinks` `sendMessage` `sendReply` `updateAccount` `updateContact` `updateConversation` `updateLink`
`newComment` props:
  conversation_id★(DROPDOWN) //Select the conversation
`newInboundMessage` props:
  inbox_id(SHORT_TEXT) //The ID of the inbox to monitor for new inbound messages.
`newOutboundMessage` props:
  inbox_id(SHORT_TEXT) //The ID of the inbox to monitor for new inbound messages.
`newTagAddedToMessage` props:
  conversation_id★(DROPDOWN) //Select the conversation
`newConversationStateChange` props:
  conversation_id★(DROPDOWN) //Select the conversation
  desired_state★(STATIC_DROPDOWN) ["Open"|"Archived"|"Deleted"|"Assigned"|"Unassigned"] //The state to trigger on (e.g., open, archived, deleted, assi
`addComment` props:
  conversation_id★(DROPDOWN) //Select the conversation
  author_id★(DROPDOWN) //Select the teammate
  body★(LONG_TEXT) //The content of the comment.
`addContactHandle` props:
  contact_id★(DROPDOWN) //Select the contact
  handle_type★(STATIC_DROPDOWN) ["Email"|"Phone"|"Twitter"|"Facebook"|"Intercom"|"front_chat"|"custom"] //Type of handle to add.
  handle_value★(SHORT_TEXT) //The value of the handle (e.g., email address, phone number).
`addConversationLinks` props:
  conversation_id★(DROPDOWN) //Select the conversation
  link_ids(MULTI_SELECT_DROPDOWN) //Select one or more links
`addConversationTags` props:
  conversation_id★(DROPDOWN) //Select the conversation
  tag_ids(MULTI_SELECT_DROPDOWN) //Select one or more tags
`assignUnassignConversation` props:
  conversation_id★(DROPDOWN) //Select the conversation
  assignee_id★(DROPDOWN) //Select the teammate
`createAccount` props:
  name★(SHORT_TEXT) //The name of the account to create.
  description(SHORT_TEXT) //A description for the account.
  domains(ARRAY) //List of domains associated with the account.
  external_id(SHORT_TEXT) //An external identifier for the account.
  custom_fields(JSON) //Custom fields for this account, as a JSON object.
`createContact` props:
  name(SHORT_TEXT) //The name of the contact.
  description(SHORT_TEXT) //A description for the contact.
  handles★(ARRAY) //List of contact handles (e.g., email, phone).
  avatar_url(FILE) //URL of the contact’s avatar image.
  links(ARRAY) //List of URLs associated with the contact.
  group_names(ARRAY) //List of group names to associate with the contact.
  list_names(ARRAY) //List of contact list names this contact belongs to. Front wi
  custom_fields(JSON) //Custom fields for this contact, as a JSON object (e.g., {"CR
`createDraft` props:
  channel_id★(DROPDOWN) //Select the channel
  to★(ARRAY) //List of recipient handles (email addresses, etc.).
  cc(ARRAY) //List of CC recipient handles.
  bcc(ARRAY) //List of BCC recipient handles.
  subject(SHORT_TEXT) //The subject of the draft.
  body★(LONG_TEXT) //The body of the draft message.
  attachments(ARRAY) //List of attachment URLs.
  mode★(STATIC_DROPDOWN)='private' ["Private"|"Shared"] //Mode of the draft reply
  signature_id(SHORT_TEXT) //The ID of the signature to use for the draft reply (if appli
  should_add_default_signature(CHECKBOX)=false //Whether to append the default signature to the draft reply (
`createDraftReply` props:
  conversation_id★(DROPDOWN) //Select the conversation
  body★(LONG_TEXT) //The content of the draft reply.
  subject(SHORT_TEXT) //The subject of the draft reply (for email channels).
  author_id★(DROPDOWN) //Select the teammate
  channel_id★(DROPDOWN) //Select the channel
  to(ARRAY) //List of recipient handles (email addresses, etc.).
  cc(ARRAY) //List of CC recipient handles.
  bcc(ARRAY) //List of BCC recipient handles.
  attachments(ARRAY) //List of attachment URLs.
  mode★(STATIC_DROPDOWN)='private' ["Private"|"Shared"] //Mode of the draft reply
  signature_id(SHORT_TEXT) //The ID of the signature to use for the draft reply (if appli
  should_add_default_signature(CHECKBOX)=false //Whether to append the default signature to the draft reply (
`createLink` props:
  name★(SHORT_TEXT) //The name of the link.
  external_url★(SHORT_TEXT) //The external URL for the link.
  pattern(SHORT_TEXT) //Optional pattern to match URLs (regex).
`findAccount` props:
  email_domain(SHORT_TEXT) //Filter accounts by email domain
  external_id(SHORT_TEXT) //Filter accounts by external ID
  limit(NUMBER) //Maximum number of accounts to return (max 100).
  page_token(SHORT_TEXT) //Token for pagination.
  sort_by(STATIC_DROPDOWN) ["Created At"|"Updated At"] //Field used to sort the accounts.
  sort_order(STATIC_DROPDOWN) ["Ascending"|"Descending"] //Order by which results should be sorted.
`findContact` props:
  email(SHORT_TEXT) //Email address to search for.
  phone(SHORT_TEXT) //Phone number to search for.
  custom_query(SHORT_TEXT) //Custom Front query string (advanced).
  limit(NUMBER) //Maximum number of contacts to return.
  page_token(SHORT_TEXT) //Token for pagination.
`findConversation` props:
  q★(SHORT_TEXT) //Front query string (e.g. subject:"Order", tag_ids:tag_123, i
  limit(NUMBER) //Maximum number of conversations to return.
  page_token(SHORT_TEXT) //Token for pagination.
`removeContactHandle` props:
  contact_id★(DROPDOWN) //Select the contact
  handle★(SHORT_TEXT) //The handle to remove.
  source★(STATIC_DROPDOWN) ["Email"|"Phone"|"Twitter"|"Facebook"|"Intercom"|"Front Chat"|"Custom"] //The type of the handle to remove.
  force(CHECKBOX)=false //If true, the entire contact will be deleted if this is their
`removeConversationLinks` props:
  conversation_id★(DROPDOWN) //Select the conversation
  links★(ARRAY) //List of external URLs to remove from the conversation.
`sendMessage` props:
  channel_id★(DROPDOWN) //Select the channel
  to★(ARRAY) //List of recipient handles (email addresses, etc.).
  cc(ARRAY) //List of CC recipient handles.
  bcc(ARRAY) //List of BCC recipient handles.
  subject(SHORT_TEXT) //The subject of the message.
  body★(LONG_TEXT) //The body of the message.
  attachments(ARRAY) //List of attachment URLs.
  tag_ids(MULTI_SELECT_DROPDOWN) //Select one or more tags
`sendReply` props:
  conversation_id★(DROPDOWN) //Select the conversation
  body★(LONG_TEXT) //The content of the reply message.
  author_id★(DROPDOWN) //Select the teammate
  subject(SHORT_TEXT) //The subject of the reply (for email channels).
  to(ARRAY) //List of recipient handles (email addresses, etc.).
  cc(ARRAY) //List of CC recipient handles.
  bcc(ARRAY) //List of BCC recipient handles.
  channel_id★(DROPDOWN) //Select the channel
  attachments(ARRAY) //List of attachment URLs.
`updateAccount` props:
  account_id★(DROPDOWN) //Select the account
  name(SHORT_TEXT) //The new name for the account.
  description(SHORT_TEXT) //The new description for the account.
  domains(ARRAY) //List of domains associated with the account.
  custom_fields(JSON) //Custom fields to add or update. Existing fields will be pres
`updateContact` props:
  contact_id★(DROPDOWN) //Select the contact
  name(SHORT_TEXT) //The new name for the contact.
  description(SHORT_TEXT) //A new description for the contact.
  avatar_url(SHORT_TEXT) //URL of the contact’s avatar image.
  links(ARRAY) //List of URLs associated with the contact.
`updateConversation` props:
  conversation_id★(DROPDOWN) //Select the conversation
  status(STATIC_DROPDOWN) ["Open"|"Archived"|"Deleted"] //The new status for the conversation.
  assignee_id★(DROPDOWN) //Select the teammate
  inbox_id(DROPDOWN) //Select the inbox
  tag_ids(MULTI_SELECT_DROPDOWN) //Select one or more tags
`updateLink` props:
  link_id(DROPDOWN) //Select the link
  name(SHORT_TEXT) //The new name for the link.
  external_url(SHORT_TEXT) //The new external URL for the link.

### zoho-desk  v2.0.1 | OAuth2
*Helpdesk management software*
**Triggers:** `new_account` `new_agent` `new_article` `new_attachment` `new_comment` `new_contact` `new_message` `new_status_change` `new_ticket` `updated_ticket`
**Actions:** `add_attachment` `add_comment` `create_account` `create_article` `create_contact` `create_ticket` `custom_api_request_beta` `draft_email_reply` `find_contact` `get_ticket` `list_all_threads` `list_tickets` `move_ticket` `search_ticket` `send_email_reply` `update_contact` `update_ticket` `custom_api_call`

### moxie-crm  v2.0.0 | Custom(apiKey,baseUrl)
*CRM build for the freelancers.*
**Triggers:** `moxie_trigger_client_created` `moxie_trigger_client_updated` `moxie_trigger_client_deleted` `moxie_trigger_project_created` `moxie_trigger_project_updated` `moxie_trigger_project_completed` `moxie_trigger_task_created` `moxie_trigger_task_updated` `moxie_trigger_task_deleted` `moxie_trigger_client_task_approval` `moxie_trigger_form_submitted` `moxie_trigger_time_entry_created` `moxie_trigger_time_entry_updated` `moxie_trigger_time_entry_deleted` `moxie_trigger_meeting_scheduled` `moxie_trigger_meeting_updated` `moxie_trigger_meeting_cancelled` `moxie_trigger_opportunity_created` `moxie_trigger_opportunity_updated` `moxie_trigger_opportunity_deleted` `moxie_trigger_invoice_sent` `moxie_trigger_payment_received`
**Actions:** `moxie_create_client` `moxie_create_task` `moxie_create_project` `custom_api_call`

### vtiger  v2.0.0 | Custom(instance_url,username,password)
*CRM software for sales, marketing, and support teams*
**Triggers:** `new_or_updated_record`
**Actions:** `create_record` `get_record` `update_record` `delete_record` `query_records` `search_records` `make_api_call` `custom_api_call`

### wealthbox  v2.0.0 | API Key
*Manage your financial advisory practice with Wealthbox. Automate contact management, note-taking, pr*
**Triggers:** `new_task` `new_contact` `new_event` `new_opportunity`
**Actions:** `create_contact` `create_note` `create_project` `add_household_member` `create_household` `create_event` `create_opportunity` `create_task` `start_workflow` `find_contact` `find_task`

### flowlu  v2.0.0 | Custom(domain,apiKey)
*Business management software*
**Actions:** `flowlu_create_contact` `flowlu_update_contact` `flowlu_delete_contact` `flowlu_create_organization` `flowlu_create_opportunity` `flowlu_update_opportunity` `flowlu_delete_opportunity` `flowlu_create_task` `flowlu_update_task` `flowlu_get_task` `flowlu_delete_task`

### linka  v2.0.0 | Custom(base_url,api_key)
*Linka white-label B2B marketplace platform powers communities and digital storefronts*
**Triggers:** `newLead` `newPayment` `newSubscription`
**Actions:** `addOrUpdateContact` `addOrUpdateContactExtended` `addOrUpdateSubscription` `createInvoice` `createProduct` `getContactDetails`

### lemlist  v2.0.0 | API Key
*Automate your cold email outreach with Lemlist. Manage leads, track activities, and update campaign *
**Triggers:** `newActivity` `unsubscribedRecipient`
**Actions:** `markLeadFromOneCampaignAsInterested` `markLeadFromOneCampaignAsNotInterested` `markLeadFromAllCampaignAsInterested` `markLeadFromAllCampaignsAsNotInterested` `pauseLeadFromAllOrSpecificCampaigns` `resumeLeadFromAllOrSpecificCampaigns` `removeLeadFromUnsubscribeList` `removeLeadFromACampaign` `unsubscribeALead` `addLeadToACampaign` `updateLeadFromCampaign` `searchLead`

### reachinbox  v2.0.0 | API Key
*Supercharge your cold email outreach with Reachinbox. Automate lead management, campaign execution, *
**Triggers:** `campaignCompleted` `emailBounced` `emailOpened` `emailSent` `leadInterested` `leadNotInterested` `replyReceived`
**Actions:** `addLeads` `addBlocklist` `addEmail` `enableWarmup` `getCampaignAnalytics` `getSummary` `pauseCampaign` `pauseWarmup` `removeEmail` `setSchedule` `startCampaign` `updateLead` `custom_api_call`

### teamleader  v2.0.1 | OAuth2
*Manage your CRM activities with Teamleader. Automate contact and company management, track deals and*
**Triggers:** `new_contact` `new_company` `new_deal` `deal_accepted` `new_invoice`
**Actions:** `create_contact` `update_contact` `create_company` `update_company` `link_contact_to_company` `unlink_contact_from_company` `create_deal` `update_deal` `search_companies` `search_contacts` `search_deals` `search_invoices` `custom_api_call`

### quickzu  v2.0.0 | API Key
*Streamline ordering from whatsapp*
**Triggers:** `quickzu_order_created_trigger`
**Actions:** `quickzu_add_product` `quickzu_update_product` `quickzu_delete_product` `quickzu_list_products` `quickzu_create_category` `quickzu_update_category` `quickzu_delete_category` `quickzu_list_categories` `quickzu_get_order_details` `quickzu_list_orders` `quickzu_list_live_orders` `quickzu_update_order_status` `quickzu_create_product_discount` `quickzu_create_promo_code` `quickzu_update_business_time`

### sperse  v2.0.0 | Custom(base_url,api_key)
*Sperse CRM enables secure payment processing and affiliate marketing for online businesses*
**Triggers:** `new_lead` `new_payment` `new_subscription`
**Actions:** `addOrUpdateContact` `addOrUpdateContactExtended` `addOrUpdateSubscription` `createInvoice` `createProduct` `getContactDetails`

### village  v2.0.0 | API Key
*The Social Capital API*
**Actions:** `getPersonPaths` `sortPeople` `enrichEmail` `enrichPersonBasic` `enrichPersonBasicBulk` `enrichEmailsBulk` `getCompanyPaths` `sortCompanies` `enrichCompanyBasic` `enrichCompanyBasicBulk`

### clearout  v2.0.0 | Custom(apiKey)
*Bulk email validation and verification*
**Actions:** `instant_verify` `custom_api_call`

### reoon-verifier  v2.0.0 | API Key
*Email validation service that cleans invalid, temporary & unsafe email addresses.*
**Actions:** `verifyEmail` `bulkEmailVerificationTask` `bulkVerificationResult`

### zerobounce  v2.0.0 | API Key
*ZeroBounce is an email validation service that helps you reduce bounces, improve email deliverabilit*
**Actions:** `validateEmail`

### lusha  v2.0.0 | API Key
*Find and enrich company data with Lusha. Search for companies and retrieve detailed business informa*
**Actions:** `search_companies` `enrich_companies` `custom_api_call`

### magical-api  v2.0.0 | API Key
*Automate resume parsing, review, scoring, and LinkedIn profile/company data retrieval with Magical A*
**Actions:** `parse_resume` `review_resume` `get_profile_data` `get_company_data` `score_resume` `custom_api_call`

### predict-leads  v2.0.0 | Custom(apiKey,apiToken)
*Company Intelligence Data Source*
**Actions:** `predict-leads_find_companies` `predict-leads_find_company_by_domain` `predict-leads_find_job_openings` `predict-leads_find_company_job_openings` `predict-leads_get_a_job_opening_by_id` `predict-leads_find_technologies_by_domain` `predict-leads_find_companies_by_technology_id` `predict-leads_find_news_by_domain` `predict-leads_find_news_event_by_id` `predict-leads_find_connections` `predict-leads_find_connections_by_domain` `custom_api_call`

### captain-data  v2.0.0 | Custom(apiKey,projectId)
*Automate data extraction and lead generation by launching workflows and retrieving job results with *
**Actions:** `launchWorkflow` `getJobResults` `custom_api_call`

### saastic  v2.0.0 | API Key
*Revenue and churn analytics for Stripe*
**Actions:** `create_customer` `create_charge` `custom_api_call`

### returning-ai  v2.0.0 | API Key
*Enhance your customer interactions with Returning AI. Automate sending, replying to, and reacting to*
**Actions:** `sendMessage` `replyMessage` `reactMessage`

### wootric  v2.0.0 | OAuth2
*Measure and boost customer happiness*
**Actions:** `trigger_wootric_survey`

### pylon  v2.0.0 | API Key
*Scale your customer support with Pylon. Use the custom API call action to interact with the Pylon AP*
**Actions:** `custom_api_call`

### talkable  v2.0.0 | Custom(site,api_key)
*Referral marketing programs that drive revenue*
**Actions:** `find_person` `find_coupon` `update_person` `anonymize_person` `unsubscribe_person` `create_purchase` `create_purchases_batch` `create_event` `create_events_batch` `refund` `get_loyalty_redeem_actions` `update-referral-status` `claim-offer` `custom_api_call`

### gameball  v2.0.0 | API Key
*Engage and retain customers with Gameball. Automate event tracking and customer loyalty interactions*
**Actions:** `sendEvent`

### upgradechat  v2.0.0 | Custom(base_url,api_key)
*Supercharge your Discord or Telegram communities with subscription payments and membership tools.*
**Triggers:** `newLead` `newPayment` `newSubscription`
**Actions:** `addOrUpdateContact` `addOrUpdateContactExtended` `addOrUpdateSubscription` `createInvoice` `createProduct` `getContactDetails`

## ★ PROJECT MANAGEMENT

### clickup  v2.0.0 | OAuth2
*All-in-one productivity platform*
**Triggers:** `clickup_trigger_task_created` `clickup_trigger_task_updated` `clickup_trigger_task_deleted` `clickup_trigger_task_priority_updated` `clickup_trigger_task_status_updated` `clickup_trigger_task_assignee_updated` `clickup_trigger_task_due_date_updated` `clickup_trigger_task_tag_updated` `clickup_trigger_task_moved` `clickup_trigger_task_comment_posted` `clickup_trigger_task_comment_updated` `clickup_trigger_task_time_estimate_updated` `clickup_trigger_task_time_tracked_updated` `clickup_trigger_list_created` `clickup_trigger_list_updated` `clickup_trigger_list_deleted` `clickup_trigger_folder_created` `clickup_trigger_folder_updated` `clickup_trigger_folder_deleted` `clickup_trigger_space_created` `clickup_trigger_space_updated` `clickup_trigger_space_deleted` `clickup_trigger_automation_created` `clickup_trigger_goal_created` `clickup_trigger_goal_updated` `clickup_trigger_goal_deleted` `clickup_trigger_key_result_created` `clickup_trigger_key_result_updated` `clickup_trigger_key_result_deleted` `task_tag_updated`
**Actions:** `create_task` `create_task_from_template` `create_folderless_list` `create_task_comments` `create_subtask` `create_channel` `create_channel_in_space_folder_list` `create_message` `create_message_reaction` `create_message_reply` `get_list` `get_list_task` `get_task_by_name` `get_space` `get_spaces` `get_task_comments` `get_channel` `get_channels` `get_channel_messages` `get_message_reactions` `get_message_replies` `list_workspace_tasks` `list_workspace_time_entries` `update_task` `update_message` `delete_message` `delete_message_reaction` `delete_task` `get_accessible_custom_fields` `set_custom_fields_value` `custom_api_call`

### asana  v2.0.0 | OAuth2
*Work management platform designed to help teams organize, track, and manage their work.*
**Actions:** `create_task` `custom_api_call`
`create_task` props:
  workspace★(DROPDOWN) //Asana workspace to create the task in
  project★(DROPDOWN) //Asana Project to create the task in
  name★(SHORT_TEXT) //The name of the task to create
  notes★(LONG_TEXT) //Free-form textual information associated with the task (i.e.
  due_on(SHORT_TEXT) //The date on which this task is due in any format.
  tags(MULTI_SELECT_DROPDOWN) //Tags to add to the task
  assignee(DROPDOWN) //Assignee for the task
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### jira-cloud  v2.0.0 | Custom(instanceUrl,email,apiToken)
*Issue tracking and project management*
**Triggers:** `new_issue` `updated_issue` `updated_issue_status`
**Actions:** `create_issue` `update_issue` `find-user` `search_issues` `assign_issue` `add_issue_attachment` `get-issue-attachment` `add-watcher-to-issue` `add_issue_comment` `update_issue_comment` `link-issues` `list_issue_comments` `delete_issue_comment` `markdownToJiraFormat` `custom_api_call`
`new_issue` props:
  jql(LONG_TEXT) //Use to filter issues watched
  sanitizeJql(CHECKBOX)=true
`updated_issue` props:
  jql(LONG_TEXT) //Use to filter issues watched
  sanitizeJql(CHECKBOX)=false
`updated_issue_status` props:
  jql(LONG_TEXT) //Use to filter issues watched
  sanitizeJql(CHECKBOX)=true
`create_issue` props:
  projectId★(DROPDOWN)
  issueTypeId★(DROPDOWN)
  issueFields★(DYNAMIC)
`update_issue` props:
  issueId★(DROPDOWN)
  statusId(DROPDOWN)
  issueFields★(DYNAMIC)
`find-user` props:
  keyword★(SHORT_TEXT)
`search_issues` props:
  jql★(LONG_TEXT) //The JQL query to use in the search
  maxResults★(NUMBER)=50
  sanitizeJql★(CHECKBOX)=true
`assign_issue` props:
  projectId★(DROPDOWN)
  issueId★(DROPDOWN)
  assignee★(DROPDOWN)
`add_issue_attachment` props:
  projectId★(DROPDOWN)
  issueId★(DROPDOWN)
  attachment★(FILE)
`get-issue-attachment` props:
  attachmentId★(SHORT_TEXT)
`add-watcher-to-issue` props:
  issueId★(DROPDOWN)
  userId★(DROPDOWN)
`add_issue_comment` props:
  projectId★(DROPDOWN)
  issueId★(DROPDOWN)
  comment★(LONG_TEXT)
  isADF(CHECKBOX)=false //https://developer.atlassian.com/cloud/jira/platform/apis/doc
`update_issue_comment` props:
  projectId★(DROPDOWN)
  issueId★(DROPDOWN)
  commentId★(DROPDOWN)
  comment★(LONG_TEXT)
`link-issues` props:
  firstIssueId★(DROPDOWN)
  issueLinkTypeId★(DROPDOWN)
  secondIssueId★(DROPDOWN)
`list_issue_comments` props:
  projectId★(DROPDOWN)
  issueId★(DROPDOWN)
  orderBy★(STATIC_DROPDOWN)='-created' ["Created (Descending)"|"Created (Ascending)"]
  limit★(NUMBER)=10 //Maximum number of results
`delete_issue_comment` props:
  projectId★(DROPDOWN)
  issueId★(DROPDOWN)
  commentId★(DROPDOWN)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### monday  v2.0.0 | API Key
*Work operating system for businesses*
**Triggers:** `monday_new_item_in_board` `monday_specific_column_updated`
**Actions:** `monday_create_column` `monday_create_group` `monday_create_item` `monday_create_update` `monday_get_board_values` `monday_get_item_column_values` `monday_update_column_values_of_item` `monday_update_item_name` `monday_upload_file_to_column`
`monday_new_item_in_board` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
`monday_specific_column_updated` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  column_id★(DROPDOWN)
`monday_create_column` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  column_title★(SHORT_TEXT)
  column_type★(STATIC_DROPDOWN)
`monday_create_group` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  group_name★(SHORT_TEXT)
`monday_create_item` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  group_id(DROPDOWN)
  item_name★(SHORT_TEXT) //Item Name
  column_values★(DYNAMIC)
  create_labels_if_missing(CHECKBOX)=false //Creates status/dropdown labels if they are missing. This req
`monday_create_update` props:
  item_id★(SHORT_TEXT)
  body★(LONG_TEXT)
`monday_get_board_values` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  column_ids(MULTI_SELECT_DROPDOWN) //Limit data output by specifying column IDs; leave empty to d
`monday_get_item_column_values` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  item_id★(DROPDOWN)
  column_ids(MULTI_SELECT_DROPDOWN) //Limit data output by specifying column IDs; leave empty to d
`monday_update_column_values_of_item` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  item_id★(DROPDOWN)
  column_values★(DYNAMIC)
`monday_update_item_name` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  item_id★(DROPDOWN)
  name★(SHORT_TEXT)
`monday_upload_file_to_column` props:
  workspace_id★(DROPDOWN)
  board_id★(DROPDOWN)
  item_id★(DROPDOWN)
  file_column_id★(DROPDOWN)
  file★(FILE) //The file URL or base64 to upload.
  file_name★(SHORT_TEXT)

### trello  v2.0.0 | Basic Auth
*Project management tool for teams*
**Triggers:** `card_moved_to_list` `new_card` `deadline`
**Actions:** `create_card` `get_card`
`card_moved_to_list` props:
  board_id★(DROPDOWN) //List of boards
  list_id★(DROPDOWN) //Get lists from a board
`new_card` props:
  board_id★(DROPDOWN) //List of boards
  list_id_opt(DROPDOWN) //Get lists from a board
`deadline` props:
  board_id★(DROPDOWN) //List of boards
  list_id_opt(DROPDOWN) //Get lists from a board
  time_unit★(STATIC_DROPDOWN)='hours' ["Minutes"|"Hours"] //Select unit for time before due
  time_before_due★(NUMBER)=24 //How long before the due date the trigger should run (use wit
`create_card` props:
  board_id★(DROPDOWN) //List of boards
  list_id★(DROPDOWN) //Get lists from a board
  name★(SHORT_TEXT) //The name of the card to create
  description(LONG_TEXT) //The description of the card to create
  position(STATIC_DROPDOWN) ["Top"|"Bottom"] //Place the card on top or bottom of the list
  labels(MULTI_SELECT_DROPDOWN) //Assign labels to the card
`get_card` props:
  cardId★(SHORT_TEXT) //The card ID

### linear  v2.0.0 | API Key
*Issue tracking for modern software teams*
**Triggers:** `new_issue` `updated_issue` `removed_issue`
**Actions:** `linear_create_issue` `linear_update_issue` `linear_create_project` `linear_update_project` `linear_create_comment` `rawGraphqlQuery`
`new_issue` props:
  team_id★(DROPDOWN) //The team for which the issue, project or comment will be cre
`updated_issue` props:
  team_id(DROPDOWN) //The team for which the issue, project or comment will be cre
`removed_issue` props:
  team_id★(DROPDOWN) //The team for which the issue, project or comment will be cre
`linear_create_issue` props:
  team_id★(DROPDOWN) //The team for which the issue, project or comment will be cre
  title★(SHORT_TEXT)
  description(LONG_TEXT)
  state_id(DROPDOWN) //Status of the Issue
  labels(MULTI_SELECT_DROPDOWN) //Labels for the Issue
  assignee_id(DROPDOWN) //Assignee of the Issue / Comment
  priority_id(DROPDOWN) //Priority of the Issue
  template_id(DROPDOWN) //ID of Template
`linear_update_issue` props:
  team_id★(DROPDOWN) //The team for which the issue, project or comment will be cre
  issue_id★(DROPDOWN) //ID of Linear Issue
  title(SHORT_TEXT)
  description(LONG_TEXT)
  state_id(DROPDOWN) //Status of the Issue
  labels(MULTI_SELECT_DROPDOWN) //Labels for the Issue
  assignee_id(DROPDOWN) //Assignee of the Issue / Comment
  priority_id(DROPDOWN) //Priority of the Issue
`linear_create_project` props:
  team_id★(DROPDOWN) //The team for which the issue, project or comment will be cre
  name★(SHORT_TEXT)
  description(LONG_TEXT)
  icon(SHORT_TEXT)
  color(SHORT_TEXT)
  startDate(DATE_TIME)
  targetDate(DATE_TIME)
`linear_update_project` props:
  team_id★(DROPDOWN) //The team for which the issue, project or comment will be cre
  project_id★(DROPDOWN) //ID of Linear Project
  name★(SHORT_TEXT)
  description(LONG_TEXT)
  icon(SHORT_TEXT)
  color(SHORT_TEXT)
  startDate(DATE_TIME)
  targetDate(DATE_TIME)
`linear_create_comment` props:
  team_id★(DROPDOWN) //The team for which the issue, project or comment will be cre
  user_id(DROPDOWN) //Assignee of the Issue / Comment
  issue_id★(DROPDOWN) //ID of Linear Issue
  body★(LONG_TEXT) //The content of the comment
`rawGraphqlQuery` props:
  query★(LONG_TEXT)
  variables(OBJECT)

### todoist  v2.0.0 | OAuth2
*To-do list and task manager*
**Triggers:** `task_completed`
**Actions:** `create_task` `update_task` `find_task` `mark_task_completed` `custom_api_call`
`task_completed` props:
  project_id(DROPDOWN) //Leave it blank if you want to get completed tasks from all y
`create_task` props:
  project_id(DROPDOWN) //Task project ID. If not set, task is put to user's Inbox.
  content★(LONG_TEXT) //The task's content. It may contain some markdown-formatted t
  description(LONG_TEXT) //A description for the task. This value may contain some mark
  labels(ARRAY) //The task's labels (a list of names that may represent either
  priority(NUMBER) //Task priority from 1 (normal) to 4 (urgent)
  due_date(SHORT_TEXT) //Can be either a specific date in YYYY-MM-DD format relative 
  section_id(DROPDOWN)
`update_task` props:
  task_id★(SHORT_TEXT)
  content(LONG_TEXT) //The task's content. It may contain some markdown-formatted t
  description(LONG_TEXT) //A description for the task. This value may contain some mark
  labels(ARRAY) //The task's labels (a list of names that may represent either
  priority(NUMBER) //Task priority from 1 (normal) to 4 (urgent)
  due_date(SHORT_TEXT) //Can be either a specific date in YYYY-MM-DD format relative 
`find_task` props:
  name★(SHORT_TEXT) //The name of the task to search for.
  project_id(DROPDOWN) //Search for tasks within the selected project. If left blank,
`mark_task_completed` props:
  task_id★(SHORT_TEXT)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### github  v2.0.0 | OAuth2
*Developer platform that allows developers to create, store, manage and share their code*
**Triggers:** `trigger_pull_request` `trigger_star` `trigger_issues` `trigger_push` `trigger_discussion` `trigger_discussion_comment` `new_branch` `new_collaborator` `new_label` `new_milestone` `new_release`
**Actions:** `github_create_issue` `getIssueInformation` `createCommentOnAIssue` `lockIssue` `unlockIssue` `rawGraphqlQuery` `github_create_pull_request_review_comment` `github_create_commit_comment` `github_create_discussion_comment` `add_labels_to_issue` `create_branch` `delete_branch` `update_issue` `find_branch` `find_issue` `find_user` `custom_api_call`
`trigger_pull_request` props:
  repository★(DROPDOWN)
`trigger_star` props:
  repository★(DROPDOWN)
`trigger_issues` props:
  repository★(DROPDOWN)
`trigger_push` props:
  repository★(DROPDOWN)
`trigger_discussion` props:
  repository★(DROPDOWN)
`trigger_discussion_comment` props:
  repository★(DROPDOWN)
`new_branch` props:
  repository★(DROPDOWN)
`new_collaborator` props:
  repository★(DROPDOWN)
`new_label` props:
  repository★(DROPDOWN)
`new_milestone` props:
  repository★(DROPDOWN)
`new_release` props:
  repository★(DROPDOWN)
`github_create_issue` props:
  repository★(DROPDOWN)
  title★(SHORT_TEXT) //The title of the issue
  description(LONG_TEXT) //The description of the issue
  labels(MULTI_SELECT_DROPDOWN) //Labels for the Issue
  assignees(MULTI_SELECT_DROPDOWN) //Assignees for the Issue
`getIssueInformation` props:
  repository★(DROPDOWN)
  issue_number★(NUMBER) //The number of the issue you want to get information from
`createCommentOnAIssue` props:
  repository★(DROPDOWN)
  issue_number★(NUMBER) //The number of the issue to comment on
  comment★(LONG_TEXT) //The comment to add to the issue
`lockIssue` props:
  repository★(DROPDOWN)
  issue_number★(NUMBER) //The number of the issue to be locked
  lock_reason(DROPDOWN) //The reason for locking the issue
`unlockIssue` props:
  repository★(DROPDOWN)
  issue_number★(NUMBER) //The number of the issue to be unlocked
`rawGraphqlQuery` props:
  query★(LONG_TEXT)
  variables(OBJECT)
`github_create_pull_request_review_comment` props:
  repository★(DROPDOWN)
  pull_number★(NUMBER) //The number of the pull request
  commit_id★(SHORT_TEXT) //The SHA of the commit to comment on
  path★(SHORT_TEXT) //The relative path to the file to comment on
  body★(LONG_TEXT) //The content of the review comment
  position★(NUMBER) //The position in the diff where the comment should be placed
`github_create_commit_comment` props:
  repository★(DROPDOWN)
  sha★(SHORT_TEXT) //The SHA of the commit to comment on
  body★(LONG_TEXT) //The content of the comment
  path(SHORT_TEXT) //The relative path to the file to comment on (optional)
  position(NUMBER) //The line index in the diff to comment on (optional)
`github_create_discussion_comment` props:
  repository★(DROPDOWN)
  discussion_number★(NUMBER) //The number of the discussion to comment on
  body★(LONG_TEXT) //The content of the comment (supports markdown)
`add_labels_to_issue` props:
  repository★(DROPDOWN)
  issue_number★(DROPDOWN) //The issue to select.
  labels★(MULTI_SELECT_DROPDOWN) //Labels for the Issue
`create_branch` props:
  repository★(DROPDOWN)
  source_branch★(DROPDOWN) //The source branch that will be used to create the new branch
  new_branch_name★(SHORT_TEXT) //The name for the new branch (e.g., 'feature/new-design').
`delete_branch` props:
  repository★(DROPDOWN)
  branch★(DROPDOWN)
`update_issue` props:
  repository★(DROPDOWN)
  issue_number★(DROPDOWN) //The issue to select.
  title(SHORT_TEXT)
  body(LONG_TEXT)
  state(STATIC_DROPDOWN) ["Open"|"Closed"] //The new state of the issue.
  state_reason(STATIC_DROPDOWN) ["Completed"|"Not Planned"|"Reopened"|"Duplicate"] //The reason for the state change. (Only used if State is chan
  milestone(DROPDOWN) //The milestone to associate this issue with.
  labels(MULTI_SELECT_DROPDOWN) //Labels for the Issue
  assignees(MULTI_SELECT_DROPDOWN) //Assignees for the Issue
`find_branch` props:
  repository★(DROPDOWN)
  branch★(SHORT_TEXT)
`find_issue` props:
  repository★(DROPDOWN)
  title★(SHORT_TEXT)
  state★(STATIC_DROPDOWN) ["Open"|"Closed"|"All"] //Filter issues by their state.
`find_user` props:
  username★(SHORT_TEXT) //The GitHub username (login) to look up.
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### gitlab  v2.0.0 | OAuth2
*Collaboration tool for developers*
**Triggers:** `project_issue_event`
**Actions:** `create_issue` `custom_api_call`
`project_issue_event` props:
  projectId★(DROPDOWN)
  actiontype★(STATIC_DROPDOWN)='all' ["All"|"Opened"|"Closed"|"Updated"] //Issue Event type for trigger
`create_issue` props:
  projectId★(DROPDOWN)
  title★(SHORT_TEXT)
  description(LONG_TEXT)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### teamwork  v2.0.0 | Custom(username,password,subdomain)
*Teamwork is a work and project management tool that helps teams improve collaboration, visibility, a*
**Triggers:** `new_task` `new_person` `new_comment` `new_message` `new_file` `new_expense` `new_invoice`
**Actions:** `create_project` `create_task_list` `create_task` `mark_task_complete` `create_company` `create_person` `update_task` `create_task_comment` `create_time_entry_on_task` `create_expense` `upload_file_to_project` `create_message_reply` `create_milestone` `add_people_to_project` `find_task` `find_company` `find_milestone` `find_notebook_or_comment`

### nifty  v2.0.0 | OAuth2
*Project management made simple*
**Actions:** `create_task` `custom_api_call`

### motion  v2.0.0 | API Key
*Optimize your schedule and manage tasks with Motion. Automate task creation, updates, and project ma*
**Triggers:** `task-created`
**Actions:** `create-task` `update-task` `create-project` `get-task` `moveTask` `find-task` `custom_api_call`

### podio  v2.0.0 | OAuth2
*Automate your workflows and workspace management with Podio. Create and update items, tasks, and com*
**Triggers:** `new_item` `new_task` `new_activity` `item_updated` `new_app` `member_added`
**Actions:** `create_item` `update_item` `create_task` `update_task` `attach_file` `create_comment` `create_status` `find_item` `find_task` `custom_api_call`

### smartsheet  v2.0.1 | API Key
*Dynamic work execution platform for teams to plan, capture, manage, automate, and report on work at *
**Triggers:** `new_row_added` `updated_row` `new_attachment_` `new_comment_webhook`
**Actions:** `add_row_to_sheet` `update_row` `attach_file_to_row` `find_rows_by_query` `find_attachment_by_row_id` `find_sheet_by_name`

### smartsuite  v2.0.0 | Custom(apiKey,accountId)
*Collaborative work management platform combining databases with spreadsheets.*
**Triggers:** `new_record` `updated_record`
**Actions:** `create_record` `update_record` `delete_record` `upload_file` `find_records` `get_record` `custom_api_call`

### notion  v2.0.1 | OAuth2
*The all-in-one workspace*
**Triggers:** `new_database_item` `updated_database_item` `new_comment` `updated_page` `new_page_created` `page_locked` `page_unlocked` `page_deleted` `updated_comment` `deleted_comment` `database_deleted` `database_schema_updated` `new_database` `database_moved`
**Actions:** `create_database_item` `update_database_item` `notion-find-database-item` `createPage` `append_to_page` `getPageOrBlockChildren` `archive_database_item` `restore_database_item` `add_comment` `retrieve_database` `get_page_comments` `find_page` `retrieve_block_children` `find_or_create_comment` `custom_api_call`

### coda  v2.0.0 | API Key
*Automate Coda docs by creating, updating, and fetching rows, managing tables, and tracking new entri*
**Triggers:** `new-row-created`
**Actions:** `create-row` `update-row` `upsert-row` `find-row` `get-row` `list-tables` `get-table` `custom_api_call`
`new-row-created` props:
  docId★(DROPDOWN)
  tableId★(DROPDOWN)
`create-row` props:
  docId★(DROPDOWN)
  tableId★(DROPDOWN)
  rowData★(DYNAMIC) //Define the data for the new row based on table columns.
`update-row` props:
  docId★(DROPDOWN)
  tableId★(DROPDOWN)
  rowIdOrName★(SHORT_TEXT)
  rowData★(DYNAMIC) //Define the data for the new row based on table columns.
`upsert-row` props:
  docId★(DROPDOWN)
  tableId★(DROPDOWN)
  keyColumns★(MULTI_SELECT_DROPDOWN)
  rowData★(DYNAMIC) //Define the data for the new row based on table columns.
`find-row` props:
  docId★(DROPDOWN)
  tableId★(DROPDOWN)
  searchColumn★(DROPDOWN)
  searchValue★(SHORT_TEXT)
`get-row` props:
  docId★(DROPDOWN)
  tableId★(DROPDOWN)
  rowIdOrName★(SHORT_TEXT)
`list-tables` props:
  docId★(DROPDOWN)
  max★(NUMBER) //Maximum number of results to return.
`get-table` props:
  docId★(DROPDOWN)
  tableId★(DROPDOWN)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### confluence  v2.0.0 | Custom(username,password,confluenceDomain)
*Manage Confluence pages and content. Retrieve page content, create pages from templates, and track n*
**Triggers:** `new-page`
**Actions:** `getPageContent` `create-page-from-template` `custom_api_call`

### mem  v2.0.0 | API Key
*Capture and organize your thoughts using Mem.ai*
**Actions:** `create_mem` `create_note` `delete_note` `custom_api_call`

### taskade  v2.0.0 | API Key
*collaboration platform for remote teams to organize and manage projects*
**Actions:** `taskade-create-task` `taskade-complete-task` `taskade-delete-task` `custom_api_call`

### ticktick  v2.0.0 | OAuth2
*Stay organized and manage your tasks with TickTick. Create, update, and complete tasks, manage proje*
**Triggers:** `new_task_created`
**Actions:** `create_task` `update_task` `get_task` `delete_task` `complete_task` `find_task` `get_project` `custom_api_call`

### toggl-track  v2.0.0 | API Key
*Toggl Track is a time tracking application that allows users to track their daily activities across *
**Triggers:** `new_client` `new_workspace` `new_project` `new_task` `new_time_entry` `new_time_entry_started` `new_tag`
**Actions:** `create_client` `create_project` `create_task` `create_tag` `create_time_entry` `start_time_entry` `stop_time_entry` `find_user` `find_project` `find_task` `find_client` `find_tag` `find_time_entry`

### harvest  v2.0.0 | OAuth2
*Time Tracking Software with Invoicing*
**Actions:** `get_clients` `get_estimates` `get_expenses` `get_invoices` `get_projects` `get_roles` `get_tasks` `get_time_entries` `get_users` `reports-uninvoiced` `custom_api_call`

### clockify  v2.0.0 | API Key
**Triggers:** `new-task` `new-time-entry` `new-timer-started`
**Actions:** `create-task` `create-time-entry` `start-timer` `stop-timer` `find-task` `find-time-entry` `find-running-timer` `custom_api_call`

### clockodo  v2.0.0 | Custom(email,token,company_name,company_email)
*Time tracking made easy*
**Triggers:** `new_entry` `new_absence_enquiry`
**Actions:** `create_entry` `get_entry` `list_entries` `update_entry` `delete_entry` `create_customer` `get_customer` `update_customer` `list_customers` `delete_customer` `create_project` `get_project` `list_projects` `update_project` `delete_project` `create_service` `get_service` `update_service` `list_services` `delete_service` `get_team` `list_teams` `get_user` `list_users` `create_user` `update_user` `delete_user` `create_absence` `get_absence` `update_absence` `list_absences` `delete_absence` `custom_api_call`

### kimai  v2.0.0 | Custom(base_url,user,api_password)
*Open-source time tracking software*
**Actions:** `create_timesheet` `custom_api_call`

### assembled  v2.0.0 | API Key
*Workforce management platform for scheduling and forecasting*
**Triggers:** `new_OOO_request` `OOO_status_changed` `schedule_updated`
**Actions:** `custom_api_call` `custom_graphql` `OOO` `add_shift` `update_OOO` `delete_OOO`

### bamboohr  v2.0.0 | Custom(companyDomain,apiKey)
*Make custom API calls to BambooHR endpoints*
**Triggers:** `reportFieldChanged`
**Actions:** `custom_api_call`

### lever  v2.0.0 | Custom(apiKey)
*Lever is a modern, collaborative recruiting platform that powers a more human approach to hiring.*
**Actions:** `getOpportunity` `updateOpportunityStage` `listOpportunityForms` `listOpportunityFeedback` `addFeedbackToOpportunity` `custom_api_call`

### netlify  v2.0.1 | OAuth2
*Netlify is a platform for building and deploying websites and apps.*
**Triggers:** `new_deploy_started` `new_deploy_succeeded` `new_deploy_failed` `new_form_submission`
**Actions:** `start_deploy` `get_site` `list_site_deploys` `list_files`

### medullar  v2.0.0 | API Key
*AI-powered discovery & insight platform that acts as your extended digital mind*
**Actions:** `createSpace` `listSpaces` `addSpaceRecord` `askSpace` `deleteSpace` `renameSpace`

### beamer  v2.0.0 | API Key
*Engage users with targeted announcements*
**Triggers:** `new_post_on_beamer`
**Actions:** `create_beamer_post` `create_new_feature_request` `create_new_comment` `create_vote` `custom_api_call`

## ★ E-COMMERCE & PAYMENTS

### shopify  v2.0.1 | Custom(shopName,adminToken)
*Ecommerce platform for online stores*
**Triggers:** `new_abandoned_checkout` `new_cancelled_order` `new_customer` `new_order` `new_cart` `new_checkout` `new_collection` `new_draft_order` `new_inventory_item` `new_product` `new_refund` `order_fulfillment` `order_payment` `checkout_creation` `updated_product` `new_paid_order`
**Actions:** `adjust_inventory_level` `cancel_order` `close_order` `create_collect` `create_customer` `create_draft_order` `create_fulfillment_event` `create_order` `create_product` `create_transaction` `get_asset` `get_customer` `get_customers` `get_customer_orders` `get_fulfillment` `get_fulfillments` `get_locations` `get_product` `get_product_variant` `get_products` `get_transaction` `get_transactions` `update_customer` `update_order` `update_product` `upload_product_image` `custom_api_call`

### woocommerce  v2.0.0 | Custom(baseUrl,consumerKey,consumerSecret)
*E-commerce platform built on WordPress*
**Triggers:** `$woocommerce_trigger_product_created` `$woocommerce_trigger_product_updated` `$woocommerce_trigger_product_deleted` `$woocommerce_trigger_order_created` `$woocommerce_trigger_order_updated` `$woocommerce_trigger_order_deleted` `$woocommerce_trigger_coupon_created` `$woocommerce_trigger_coupon_updated` `$woocommerce_trigger_coupon_deleted` `$woocommerce_trigger_customer_created` `$woocommerce_trigger_customer_updated` `$woocommerce_trigger_customer_deleted`
**Actions:** `Create Customer` `Create Coupon` `Create Product` `Find Customer` `Find Product` `custom_api_call`
`Create Customer` props:
  email★(SHORT_TEXT) //Enter the email
  first_name★(SHORT_TEXT) //Enter the first name
  last_name★(SHORT_TEXT) //Enter the last name
  username★(SHORT_TEXT) //Enter the username
  password★(SHORT_TEXT) //Enter the password
  street_address★(SHORT_TEXT) //Enter the street address
  city★(SHORT_TEXT) //Enter the city
  state★(SHORT_TEXT) //Enter the state
  postcode★(SHORT_TEXT) //Enter the postcode
  country★(SHORT_TEXT) //Enter the country
  phone★(SHORT_TEXT) //Enter the phone
`Create Coupon` props:
  code★(SHORT_TEXT) //Enter the coupon code
  discount_type★(STATIC_DROPDOWN) ["Fixed cart"|"Fixed product"|"Percent"|"Percent product"] //Select the discount type
  amount★(NUMBER) //Enter the amount
  minimum_amount★(NUMBER) //Enter the minimum amount
`Create Product` props:
  name★(SHORT_TEXT) //Enter the name
  type★(STATIC_DROPDOWN) ["Simple"|"Grouped"|"External"|"Variable"] //Select the type
  regular_price★(NUMBER) //Enter the regular price
  description★(LONG_TEXT) //Enter the description
  short_description★(LONG_TEXT) //Enter the short description
  categories★(SHORT_TEXT) //Enter the category IDs (comma separated)
  images★(LONG_TEXT) //Enter the URLs of images you want to upload (comma separated
`Find Customer` props:
  email★(SHORT_TEXT) //Enter the email
`Find Product` props:
  id★(SHORT_TEXT) //Enter the product ID
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### stripe  v2.0.0 | API Key
*Online payment processing for internet businesses*
**Triggers:** `new_payment` `new_customer` `payment_failed` `new_subscription` `new_charge` `new_invoice` `invoice_payment_failed` `canceled_subscription` `new_refund` `new_dispute` `new_payment_link` `updated_subscription` `checkout_session_completed`
**Actions:** `create_customer` `create_invoice` `search_customer` `search_subscriptions` `retrieve_customer` `update_customer` `create_payment_intent` `create_product` `create_price` `create_subscription` `cancel_subscription` `retrieve_invoice` `retrieve_payout` `create_refund` `create_payment_link` `deactivate_payment_link` `retrieve_payment_intent` `find_invoice` `custom_api_call`
`new_invoice` props:
  status(STATIC_DROPDOWN) ["Draft"|"Open"|"Paid"|"Uncollectible"|"Void"] //Only trigger for invoices with this status.
  customer(SHORT_TEXT) //Only trigger for invoices belonging to this customer ID (e.g
  subscription(SHORT_TEXT) //Only trigger for invoices belonging to this subscription ID 
`invoice_payment_failed` props:
  customer(SHORT_TEXT) //Only trigger for invoices belonging to this customer ID (e.g
`canceled_subscription` props:
  customer(SHORT_TEXT) //Only trigger for subscriptions belonging to this customer ID
`new_refund` props:
  charge(SHORT_TEXT) //Only trigger for refunds related to this Charge ID (e.g., `c
  payment_intent(SHORT_TEXT) //Only trigger for refunds related to this Payment Intent ID (
`new_dispute` props:
  charge(SHORT_TEXT) //Only trigger for disputes related to this Charge ID (e.g., `
  payment_intent(SHORT_TEXT) //Only trigger for disputes related to this Payment Intent ID 
`updated_subscription` props:
  status(STATIC_DROPDOWN) ["Incomplete"|"Incomplete - Expired"|"Trialing"|"Active"|"Past Due"|"Canceled"|"Unpaid"|"Paused"] //Only trigger when the subscription is updated to this status
  customer(SHORT_TEXT) //Only trigger for subscriptions belonging to this customer ID
`checkout_session_completed` props:
  customer(SHORT_TEXT) //Only trigger for checkout sessions created by this customer 
`create_customer` props:
  email★(SHORT_TEXT)
  name★(SHORT_TEXT)
  description(LONG_TEXT)
  phone(SHORT_TEXT)
  line1(SHORT_TEXT)
  postal_code(SHORT_TEXT)
  city(SHORT_TEXT)
  state(SHORT_TEXT)
  country(SHORT_TEXT)
`create_invoice` props:
  customer_id★(SHORT_TEXT) //Stripe Customer ID
  currency★(SHORT_TEXT) //Currency for the invoice (e.g., USD)
  description(LONG_TEXT) //Description for the invoice
`search_customer` props:
  email★(SHORT_TEXT)
`search_subscriptions` props:
  price_ids(LONG_TEXT) //Comma-separated list of price IDs to filter by (e.g., price_
  status(STATIC_DROPDOWN) ["All Statuses"|"Active"|"Past Due"|"Unpaid"|"Canceled"|"Incomplete"|"Incomplete Expired"|"Trialing"|"Paused"] //Filter by subscription status
  customer_id(SHORT_TEXT) //Filter by specific customer ID (optional)
  created_after(DATE_TIME) //Filter subscriptions created after this date (YYYY-MM-DD for
  created_before(DATE_TIME) //Filter subscriptions created before this date (YYYY-MM-DD fo
  limit(NUMBER)=100 //Maximum number of subscriptions to return (default: 100, set
  fetch_all(CHECKBOX)=false //Fetch all matching subscriptions (ignores limit, may take lo
  include_customer_details(CHECKBOX)=true //Fetch detailed customer information for each subscription
`retrieve_customer` props:
  id★(SHORT_TEXT)
`update_customer` props:
  customer★(DROPDOWN)
  email(SHORT_TEXT)
  name(SHORT_TEXT)
  description(LONG_TEXT)
  phone(SHORT_TEXT)
  line1(SHORT_TEXT)
  postal_code(SHORT_TEXT)
  city(SHORT_TEXT)
  state(SHORT_TEXT)
  country(SHORT_TEXT)
`create_payment_intent` props:
  amount★(NUMBER) //The amount to charge, in a decimal format (e.g., 10.50 for $
  currency★(STATIC_DROPDOWN) //The three-letter ISO code for the currency.
  customer★(DROPDOWN)
  payment_method(SHORT_TEXT) //The ID of the Payment Method to attach (e.g., `pm_...`). Req
  confirm(CHECKBOX)=false //If true, Stripe will attempt to charge the provided payment 
  return_url(SHORT_TEXT) //The URL to redirect your customer back to after they authent
  description(LONG_TEXT)
  receipt_email(SHORT_TEXT) //The email address to send a receipt to. This will override t
`create_product` props:
  name★(SHORT_TEXT) //The product’s name, meant to be displayable to the customer.
  description(LONG_TEXT) //The product’s description, meant to be displayable to the cu
  active(CHECKBOX) //Whether the product is currently available for purchase. Def
  images(ARRAY) //A list of up to 8 URLs of images for this product.
  url(SHORT_TEXT) //A publicly-accessible online page for this product.
  metadata(JSON) //A set of key-value pairs to store additional information abo
`create_price` props:
  product★(DROPDOWN)
  unit_amount★(NUMBER) //The price amount as a decimal, for example, 25.50 for $25.50
  currency★(STATIC_DROPDOWN) //The three-letter ISO code for the currency.
  recurring_interval★(STATIC_DROPDOWN)='one_time' ["One-Time"|"Daily"|"Weekly"|"Monthly"|"Yearly"] //Specify the billing frequency. Select 'One-Time' for a singl
  recurring_interval_count(NUMBER) //The number of intervals between subscription billings (e.g.,
`create_subscription` props:
  customer★(DROPDOWN)
  items★(ARRAY) //A list of prices to subscribe the customer to.
  collection_method(STATIC_DROPDOWN) ["Charge Automatically"|"Send Invoice"] //How to collect payment. 'charge_automatically' will try to b
  days_until_due(NUMBER) //Number of days before an invoice is due. Required if Collect
  trial_period_days(NUMBER) //Integer representing the number of trial days the customer r
  default_payment_method(SHORT_TEXT) //ID of the default payment method for the subscription (e.g.,
  metadata(JSON)
`cancel_subscription` props:
  subscription★(DROPDOWN)
  cancel_at_period_end(CHECKBOX)=false //If true, the subscription remains active until the end of th
`retrieve_invoice` props:
  invoice_id★(DROPDOWN)
`retrieve_payout` props:
  payout_id★(DROPDOWN)
`create_refund` props:
  payment_intent★(DROPDOWN)
  amount(NUMBER) //The amount to refund (e.g., 12.99). If left blank, a full re
  reason(STATIC_DROPDOWN) ["Duplicate"|"Fraudulent"|"Requested by Customer"] //An optional reason for the refund.
  metadata(JSON) //A set of key-value pairs to store additional information abo
`create_payment_link` props:
  line_items★(ARRAY) //The products and quantities to include in the payment link.
  after_completion_type(STATIC_DROPDOWN) ["Show Confirmation Page"|"Redirect to URL"] //Controls the behavior after the purchase is complete. Defaul
  after_completion_redirect_url(SHORT_TEXT) //The URL to redirect the customer to after a successful purch
  allow_promotion_codes(CHECKBOX) //Enables the user to enter a promotion code on the Payment Li
  billing_address_collection(STATIC_DROPDOWN) ["Auto"|"Required"] //Describes whether Checkout should collect the customer’s bil
  metadata(JSON)
`deactivate_payment_link` props:
  payment_link_id★(DROPDOWN)
`retrieve_payment_intent` props:
  payment_intent_id★(DROPDOWN)
`find_invoice` props:
  invoice_id★(DROPDOWN)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### xero  v2.0.1 | OAuth2
*Beautiful accounting software*
**Triggers:** `xero_new_contact` `xero_contact_updated` `xero_new_sales_invoice` `xero_updated_sales_invoice` `xero_bill_created` `xero_bill_updated` `xero_invoice_created` `xero_invoice_updated` `xero_new_or_updated_contact` `xero_new_bank_transaction` `xero_new_payment` `xero_new_purchase_order` `xero_new_reconciled_payment` `xero_updated_quote` `xero_new_bill` `xero_new_credit_note` `xero_new_project` `xero_new_quote` `xero_new_employee` `xero_updated_employee` `xero_new_payslip` `xero_overdue_sales_invoice`
**Actions:** `xero_create_contact` `xero_create_invoice` `xero_allocate_credit_note_to_invoice` `xero_create_bank_transfer` `xero_create_quote_draft` `xero_send_invoice_email` `xero_create_bill` `xero_create_payment` `xero_create_purchase_order` `xero_update_purchase_order` `xero_upload_attachment` `xero_add_items_to_sales_invoice` `xero_create_credit_note` `xero_create_inventory_item` `xero_create_project` `xero_update_sales_invoice` `xero_create_repeating_sales_invoice` `xero_create_account` `xero_create_bank_transaction` `xero_create_employee` `xero_add_note_to_invoice` `xero_add_or_update_stock_items` `xero_delete_credit_note_allocation` `xero_update_contact` `xero_update_quote` `xero_update_employee` `xero_delete_invoice` `xero_void_invoice` `xero_delete_purchase_order` `xero_get_contact_by_id` `xero_get_item_by_id` `xero_get_invoices` `xero_get_invoice_url` `xero_get_tax_rates` `xero_get_tracking_categories` `xero_get_invoice_history` `xero_find_contact` `xero_find_invoice` `xero_find_invoice_by_id` `xero_find_invoice_by_contact_id` `xero_find_credit_note` `xero_find_item` `xero_find_employee` `xero_find_payment` `xero_find_purchase_order` `xero_find_quote` `xero_search_bank_transactions` `xero_search_invoice` `xero_search_contact_by_email` `custom_api_call`
`xero_new_contact` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_contact(CHECKBOX)=true //If enabled, fetches the full contact from Xero using the Res
`xero_contact_updated` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_contact(CHECKBOX)=true //Fetch the full contact record from Xero using the Resource U
`xero_new_sales_invoice` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_invoice(CHECKBOX)=true //Fetch the full invoice and ensure Type is ACCREC (recommende
`xero_updated_sales_invoice` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_invoice(CHECKBOX)=true //Fetch the full invoice and ensure Type is ACCREC (recommende
`xero_bill_created` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_bill(CHECKBOX)=true //Fetch the full bill from Xero and verify it is a bill (Type=
`xero_bill_updated` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_bill(CHECKBOX)=true //Fetch the full bill from Xero and verify it is a bill (Type=
`xero_invoice_created` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_invoice(CHECKBOX)=true //Fetch the full invoice record from Xero using the Resource U
`xero_invoice_updated` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_invoice(CHECKBOX)=true //Fetch the full invoice record from Xero using the Resource U
`xero_new_or_updated_contact` props:
  webhookInstructions(MARKDOWN) //To use this trigger, manually configure a Xero webhook for y
  tenant_id★(DROPDOWN)
  webhook_key★(SHORT_TEXT) //From Xero Developer portal > Your App > Webhooks. Used to ve
  fetch_full_contact(CHECKBOX)=true //If enabled, fetches the full contact from Xero using the Res
`xero_new_bank_transaction` props:
  tenant_id★(DROPDOWN)
  types(STATIC_MULTI_SELECT_DROPDOWN) ["RECEIVE"|"SPEND"|"RECEIVE-OVERPAYMENT"|"SPEND-OVERPAYMENT"|"RECEIVE-PREPAYMENT"|"SPEND-PREPAYMENT"|"RECEIVE-TRANSFER"|"SPEND-TRANSFER"]
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["AUTHORISED"|"DELETED"]
  contact_id(DROPDOWN) //Select a contact
  bank_account_id(DROPDOWN) //Select a bank account
  bank_account_code(SHORT_TEXT)
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  page_size(NUMBER)
`xero_new_payment` props:
  tenant_id★(DROPDOWN)
  payment_types(STATIC_MULTI_SELECT_DROPDOWN) ["ACCRECPAYMENT (Received on Sales Invoice)"|"ACCPAYPAYMENT (Paid on Bill)"]
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["AUTHORISED"|"DELETED"]
  invoice_id(DROPDOWN) //Select an invoice
  reference(SHORT_TEXT)
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  page_size(NUMBER)
`xero_new_purchase_order` props:
  tenant_id★(DROPDOWN)
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"SUBMITTED"|"AUTHORISED"|"BILLED"|"DELETED"]
  first_time_status(STATIC_DROPDOWN) ["DRAFT"|"SUBMITTED"|"AUTHORISED"|"BILLED"|"DELETED"] //Also fire when a purchase order enters this status for the f
  contact_id(DROPDOWN) //Select a contact
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  page_size(NUMBER)
`xero_new_reconciled_payment` props:
  tenant_id★(DROPDOWN)
  payment_types(STATIC_MULTI_SELECT_DROPDOWN) ["ACCRECPAYMENT (Received on Sales Invoice)"|"ACCPAYPAYMENT (Paid on Bill)"]
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["AUTHORISED"|"DELETED"]
  invoice_id(DROPDOWN) //Select an invoice
  reference(SHORT_TEXT)
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  page_size(NUMBER)
`xero_updated_quote` props:
  tenant_id★(DROPDOWN)
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"SENT"|"ACCEPTED"|"DECLINED"|"INVOICED"|"DELETED"]
  contact_id(DROPDOWN) //Select a contact
  quote_number(SHORT_TEXT)
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  expiry_date_from(SHORT_TEXT)
  expiry_date_to(SHORT_TEXT)
  page_size(NUMBER)
`xero_new_bill` props:
  tenant_id★(DROPDOWN)
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"SUBMITTED"|"AUTHORISED"|"PAID"|"VOIDED"|"DELETED"]
  contact_id(DROPDOWN) //Select a contact
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  summary_only(CHECKBOX)=true
  page_size(NUMBER)
`xero_new_credit_note` props:
  tenant_id★(DROPDOWN)
  types(STATIC_MULTI_SELECT_DROPDOWN) ["ACCRECCREDIT (Sales Credit)"|"ACCPAYCREDIT (Supplier Credit)"]
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"AUTHORISED"|"PAID"|"VOIDED"]
  contact_id(DROPDOWN) //Select a contact
  reference(SHORT_TEXT)
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  page_size(NUMBER)
`xero_new_project` props:
  tenant_id★(DROPDOWN)
  contact_id(DROPDOWN) //Select a contact
  states(STATIC_MULTI_SELECT_DROPDOWN) ["INPROGRESS"|"CLOSED"]
  page_size(NUMBER)
`xero_new_quote` props:
  tenant_id★(DROPDOWN)
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"SENT"|"ACCEPTED"|"DECLINED"|"INVOICED"|"DELETED"]
  contact_id(DROPDOWN) //Select a contact
  quote_number(SHORT_TEXT)
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  expiry_date_from(SHORT_TEXT)
  expiry_date_to(SHORT_TEXT)
  page_size(NUMBER)
`xero_new_employee` props:
  tenant_id★(DROPDOWN)
  page_size(NUMBER)
`xero_updated_employee` props:
  tenant_id★(DROPDOWN)
`xero_new_payslip` props:
  tenant_id★(DROPDOWN)
`xero_overdue_sales_invoice` props:
  tenant_id★(DROPDOWN)
  overdue_days(NUMBER)=0 //Number of days past the due date before triggering. Use 0 to
  page_size(NUMBER)
`xero_create_contact` props:
  tenant_id★(DROPDOWN)
  contact_id(DROPDOWN) //Select a contact
  name★(SHORT_TEXT) //Full name of the contact (required for create, max 500 chars
  first_name(SHORT_TEXT)
  last_name(SHORT_TEXT)
  email(SHORT_TEXT)
  account_number(SHORT_TEXT) //Unique customer or supplier account number (max 50 chars).
  phone_default(SHORT_TEXT)
  phone_mobile(SHORT_TEXT)
  phone_fax(SHORT_TEXT)
  phone_ddi(SHORT_TEXT)
  website(SHORT_TEXT)
  tax_number(SHORT_TEXT)
  bank_account_details(SHORT_TEXT) //Bank account number for the contact.
  is_supplier(CHECKBOX)=false //Mark this contact as a supplier / vendor.
  is_customer(CHECKBOX)=false //Mark this contact as a customer.
  default_currency(SHORT_TEXT) //ISO 4217 currency code, e.g. AUD, USD, GBP.
  street_address_line1(SHORT_TEXT)
  street_address_line2(SHORT_TEXT)
  street_city(SHORT_TEXT)
  street_region(SHORT_TEXT)
  street_postal_code(SHORT_TEXT)
  street_country(SHORT_TEXT)
  accounts_receivable_tax_type(SHORT_TEXT) //Default tax type for sales/receivables (e.g. OUTPUT2).
  accounts_payable_tax_type(SHORT_TEXT) //Default tax type for purchases/payables (e.g. INPUT2).
  contact_status(STATIC_DROPDOWN) ["Active"|"Archived"]
`xero_create_invoice` props:
  tenant_id★(DROPDOWN)
  invoice_id(DROPDOWN) //Select an invoice
  invoice_type★(STATIC_DROPDOWN)='ACCREC' ["Sales Invoice (ACCREC)"|"Bill / Accounts Payable (ACCPAY)"] //ACCREC = Sales Invoice (money coming in), ACCPAY = Bill (mon
  contact_id★(DROPDOWN) //Select a contact
  status★(STATIC_DROPDOWN)='DRAFT' ["Draft"|"Submitted"|"Authorised"|"Deleted"|"Voided"]
  li_description★(LONG_TEXT) //Description of the goods or service. Required for each line 
  li_quantity(NUMBER)=1
  li_unit_amount(NUMBER) //Price per unit (excluding tax). e.g. 100.00
  li_account_code(SHORT_TEXT) //The account code to post this line to (e.g. "200" for Sales)
  li_tax_type(SHORT_TEXT) //Tax type for this line (e.g. NONE, OUTPUT2, INPUT2). Leave b
  li_item_code(SHORT_TEXT) //Optional item/product code from your Xero inventory.
  li_discount_rate(NUMBER) //Percentage discount to apply to this line (0–100).
  date(SHORT_TEXT)
  due_date(SHORT_TEXT)
  invoice_number(SHORT_TEXT) //Custom invoice number. Auto-generated by Xero if left blank.
  reference(SHORT_TEXT) //Optional reference text shown on the invoice.
  line_amount_types(STATIC_DROPDOWN) ["Exclusive (tax added on top)"|"Inclusive (tax included in amount)"|"No Tax"] //How tax is applied to line amounts.
  currency_code(DROPDOWN) //Select a currency code
  branding_theme_id(DROPDOWN) //Select a branding theme
  url(SHORT_TEXT) //Link (URL) attached to this invoice.
  sent_to_contact(CHECKBOX)=false
`xero_allocate_credit_note_to_invoice` props:
  tenant_id★(DROPDOWN)
  credit_note_id★(DROPDOWN) //Select a credit note to allocate from
  invoice_id★(DROPDOWN) //Select an invoice
  amount★(NUMBER) //The amount of the credit to allocate.
  date(SHORT_TEXT) //Date of allocation. Format: YYYY-MM-DD. Optional.
`xero_create_bank_transfer` props:
  tenant_id★(DROPDOWN)
  from_bank_account_id★(DROPDOWN) //Select a bank account
  to_bank_account_id★(DROPDOWN) //Select a bank account
  amount★(NUMBER) //Amount to transfer. Currencies must match between accounts.
  date(SHORT_TEXT) //YYYY-MM-DD. Defaults to today if not provided.
  reference(SHORT_TEXT) //Reference for the transfer.
  from_is_reconciled(CHECKBOX)=false //Mark source account transaction as reconciled.
  to_is_reconciled(CHECKBOX)=false //Mark destination account transaction as reconciled.
`xero_create_quote_draft` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
  date★(SHORT_TEXT) //Date the quote was issued (YYYY-MM-DD).
  expiry_date(SHORT_TEXT) //Date the quote expires (YYYY-MM-DD).
  line_item★(OBJECT) //At minimum, provide a Description.
  line_amount_types(STATIC_DROPDOWN) ["Exclusive"|"Inclusive"|"NoTax"]
  reference(SHORT_TEXT)
  quote_number(SHORT_TEXT)
  title(SHORT_TEXT)
  summary(LONG_TEXT)
  terms(LONG_TEXT)
  status(STATIC_DROPDOWN)='DRAFT' ["Draft"]
`xero_send_invoice_email` props:
  tenant_id★(DROPDOWN)
  invoice_id★(DROPDOWN) //Select a sales invoice with a valid status for sending email
`xero_create_bill` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
  line_item★(OBJECT) //At minimum, provide a Description.
  date(SHORT_TEXT) //Date the bill was issued (YYYY-MM-DD). Optional.
  due_date(SHORT_TEXT) //Date the bill is due (YYYY-MM-DD). Optional.
  line_amount_types(STATIC_DROPDOWN) ["Exclusive"|"Inclusive"|"NoTax"]
  invoice_number(SHORT_TEXT)
  status(STATIC_DROPDOWN)='DRAFT' ["Draft"|"Submitted"|"Authorised"]
`xero_create_payment` props:
  tenant_id★(DROPDOWN)
  invoice_id★(DROPDOWN) //Select an authorised invoice (sales or bill) to apply paymen
  account_id★(DROPDOWN) //Select a bank account
  amount★(NUMBER) //Payment amount (must be <= amount due).
  date★(SHORT_TEXT) //YYYY-MM-DD.
  reference(SHORT_TEXT)
  is_reconciled(CHECKBOX)=false //Mark payment as reconciled (optional).
`xero_create_purchase_order` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
  line_item★(OBJECT) //At minimum, provide a Description.
  date(SHORT_TEXT) //Date the purchase order was issued (YYYY-MM-DD). Optional.
  delivery_date(SHORT_TEXT) //Date goods are to be delivered (YYYY-MM-DD). Optional.
  line_amount_types(STATIC_DROPDOWN) ["Exclusive"|"Inclusive"|"NoTax"]
  purchase_order_number(SHORT_TEXT)
  reference(SHORT_TEXT)
  branding_theme_id(DROPDOWN) //Select a branding theme
  status(STATIC_DROPDOWN)='DRAFT' ["Draft"|"Submitted"|"Authorised"|"Billed"|"Deleted"]
  delivery_address(LONG_TEXT)
  attention_to(SHORT_TEXT)
  telephone(SHORT_TEXT)
  delivery_instructions(LONG_TEXT)
  expected_arrival_date(SHORT_TEXT) //YYYY-MM-DD. Optional.
`xero_update_purchase_order` props:
  tenant_id★(DROPDOWN)
  purchase_order_id★(DROPDOWN) //Select a purchase order to update
  status(STATIC_DROPDOWN) ["Draft"|"Submitted"|"Authorised"|"Billed"|"Deleted"]
  sent_to_contact(CHECKBOX)=false
  delivery_address(LONG_TEXT)
  attention_to(SHORT_TEXT)
  telephone(SHORT_TEXT)
  delivery_instructions(LONG_TEXT)
  expected_arrival_date(SHORT_TEXT)
`xero_upload_attachment` props:
  tenant_id★(DROPDOWN)
  resource_type★(STATIC_DROPDOWN) //The Xero resource to attach the file to.
  resource_id★(DROPDOWN) //Select the specific resource to attach the file to.
  file★(FILE) //The file to upload. Max 10MB per Xero limits.
  file_name(SHORT_TEXT) //Optional file name to use in Xero. Avoid characters: < > : "
  content_type(SHORT_TEXT) //MIME type of the file (e.g., image/png). If not set, will be
  include_online(CHECKBOX)=false //Only applicable to ACCREC invoices and ACCREC credit notes. 
`xero_add_items_to_sales_invoice` props:
  tenant_id★(DROPDOWN)
  invoice_id★(DROPDOWN) //Select an invoice
  allow_authorised(CHECKBOX)=false //Enable adding items to AUTHORISED invoices (Xero allows limi
  new_line_items★(ARRAY)
`xero_create_credit_note` props:
  tenant_id★(DROPDOWN)
  type★(STATIC_DROPDOWN)='ACCRECCREDIT' ["Accounts Receivable Credit (ACCRECCREDIT)"|"Accounts Payable Credit (ACCPAYCREDIT)"]
  contact_id★(DROPDOWN) //Select a contact
  date(SHORT_TEXT) //YYYY-MM-DD. Defaults to today if not provided.
  status(STATIC_DROPDOWN)='DRAFT' ["Draft"|"Authorised"]
  line_amount_types(STATIC_DROPDOWN) ["Exclusive"|"Inclusive"|"NoTax"]
  credit_note_number(SHORT_TEXT)
  reference(SHORT_TEXT)
  currency_code(SHORT_TEXT)
  branding_theme_id(DROPDOWN) //Select a branding theme
  line_items(ARRAY) //Add one or more line items. At minimum, each line needs a De
`xero_create_inventory_item` props:
  tenant_id★(DROPDOWN)
  code★(SHORT_TEXT)
  name(SHORT_TEXT)
  description(LONG_TEXT)
  purchase_description(LONG_TEXT)
  is_sold(CHECKBOX)=true
  is_purchased(CHECKBOX)=true
  sales_details(OBJECT)
  sales_account_id(DROPDOWN) //Select an account
  purchase_details(OBJECT)
  purchase_account_id(DROPDOWN) //Select an account
  cogs_account_id(DROPDOWN) //Select an account
  inventory_asset_account_id(DROPDOWN) //Select an account
`xero_create_project` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
  name★(SHORT_TEXT)
  deadline_utc(SHORT_TEXT) //Example: 2017-04-23T18:25:43.511Z
  estimate_amount(NUMBER)
`xero_update_sales_invoice` props:
  tenant_id★(DROPDOWN)
  allow_authorised(CHECKBOX)=false //Enable updates for AUTHORISED invoices (Xero allows limited 
  invoice_id★(DROPDOWN) //Select a sales invoice (ACCREC) with DRAFT or SUBMITTED stat
  reference(SHORT_TEXT)
  due_date(SHORT_TEXT)
  invoice_number(SHORT_TEXT)
  branding_theme_id(DROPDOWN) //Select a branding theme
  url(SHORT_TEXT)
  contact_id(DROPDOWN) //Select a contact
  status(STATIC_DROPDOWN) ["Draft"|"Submitted"|"Authorised"|"Voided"|"Deleted"]
  sent_to_contact(CHECKBOX)=false
  replace_all_line_items(CHECKBOX)=false //If enabled, only the provided line_items will remain. If dis
  line_items(ARRAY)
`xero_create_repeating_sales_invoice` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
  schedule_period★(NUMBER) //Integer period (e.g., 1 every week, 2 every month).
  schedule_unit★(STATIC_DROPDOWN) ["Weekly"|"Monthly"]
  due_date★(NUMBER) //Day number used with due date type (e.g., 20, 31).
  due_date_type★(DROPDOWN)
  start_date★(SHORT_TEXT)
  end_date(SHORT_TEXT)
  line_amount_types★(STATIC_DROPDOWN)='Exclusive' ["Exclusive"|"Inclusive"|"NoTax"]
  currency_code★(DROPDOWN) //Select a currency code
  status★(STATIC_DROPDOWN)='DRAFT' ["Draft"|"Authorised"]
  reference(SHORT_TEXT)
  branding_theme_id(DROPDOWN) //Select a branding theme
  approved_for_sending(CHECKBOX)=false
  send_copy(CHECKBOX)=false
  mark_as_sent(CHECKBOX)=false
  include_pdf(CHECKBOX)=false
  line_items★(ARRAY)
`xero_create_account` props:
  tenant_id★(DROPDOWN)
  code★(SHORT_TEXT) //Unique account code (e.g. 200).
  name★(SHORT_TEXT)
  type★(STATIC_DROPDOWN)
  description(LONG_TEXT)
  tax_type(SHORT_TEXT) //e.g. NONE, GST, INPUT
  enable_payments(CHECKBOX)=false
`xero_create_bank_transaction` props:
  tenant_id★(DROPDOWN)
  type★(STATIC_DROPDOWN) ["Spend Money"|"Receive Money"]
  bank_account_id★(DROPDOWN) //Select a bank account
  date(SHORT_TEXT)
  reference(SHORT_TEXT)
  contact_id(SHORT_TEXT)
  line_items★(ARRAY)
  is_reconciled(CHECKBOX)=false
`xero_create_employee` props:
  tenant_id★(DROPDOWN)
  first_name★(SHORT_TEXT)
  last_name★(SHORT_TEXT)
  date_of_birth★(SHORT_TEXT)
  gender★(STATIC_DROPDOWN) ["Male"|"Female"|"Indeterminate / Intersex / Unspecified"]
  start_date★(SHORT_TEXT)
  email(SHORT_TEXT)
  job_title(SHORT_TEXT)
  employment_basis(STATIC_DROPDOWN) ["Full-Time"|"Part-Time"|"Casual"|"Labour Hire"|"Superannuation Income Stream"]
  phone(SHORT_TEXT)
  mobile(SHORT_TEXT)
`xero_add_note_to_invoice` props:
  tenant_id★(DROPDOWN)
  invoice_id★(SHORT_TEXT) //Xero InvoiceID (GUID).
  note★(LONG_TEXT) //The note text to add to the invoice history.
`xero_add_or_update_stock_items` props:
  tenant_id★(DROPDOWN)
  items★(ARRAY)
`xero_delete_credit_note_allocation` props:
  tenant_id★(DROPDOWN)
  credit_note_id★(DROPDOWN) //Select a credit note to allocate from
  allocation_id★(SHORT_TEXT) //The AllocationID (GUID) of the credit note allocation to del
`xero_update_contact` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
  name(SHORT_TEXT)
  email(SHORT_TEXT)
  first_name(SHORT_TEXT)
  last_name(SHORT_TEXT)
  account_number(SHORT_TEXT)
  phone(SHORT_TEXT)
  website(SHORT_TEXT)
  tax_number(SHORT_TEXT)
  is_supplier(CHECKBOX)
  is_customer(CHECKBOX)
  default_currency(SHORT_TEXT)
`xero_update_quote` props:
  tenant_id★(DROPDOWN)
  quote_id★(SHORT_TEXT) //The Xero QuoteID (GUID) of the quote to update.
  status(STATIC_DROPDOWN) ["Draft"|"Sent"|"Declined"|"Accepted"|"Invoiced"|"Deleted"]
  title(SHORT_TEXT)
  summary(LONG_TEXT)
  reference(SHORT_TEXT)
  expiry_date(SHORT_TEXT)
  terms(LONG_TEXT)
`xero_update_employee` props:
  tenant_id★(DROPDOWN)
  employee_id★(SHORT_TEXT) //Xero EmployeeID (GUID).
  first_name(SHORT_TEXT)
  last_name(SHORT_TEXT)
  email(SHORT_TEXT)
  job_title(SHORT_TEXT)
  termination_date(SHORT_TEXT)
  status(STATIC_DROPDOWN) ["Active"|"Terminated"]
  phone(SHORT_TEXT)
  mobile(SHORT_TEXT)
`xero_delete_invoice` props:
  tenant_id★(DROPDOWN)
  invoice_id★(SHORT_TEXT) //The Xero InvoiceID (GUID) of the invoice to delete. Only DRA
`xero_void_invoice` props:
  tenant_id★(DROPDOWN)
  invoice_id★(SHORT_TEXT) //The Xero InvoiceID (GUID) of the invoice to void. Must be AU
`xero_delete_purchase_order` props:
  tenant_id★(DROPDOWN)
  purchase_order_id★(DROPDOWN) //Select a purchase order to update
`xero_get_contact_by_id` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
`xero_get_item_by_id` props:
  tenant_id★(DROPDOWN)
  item_id★(SHORT_TEXT) //Xero ItemID (GUID).
`xero_get_invoices` props:
  tenant_id★(DROPDOWN)
  type(STATIC_DROPDOWN) ["All"|"Sales Invoice (ACCREC)"|"Bill (ACCPAY)"]
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"SUBMITTED"|"AUTHORISED"|"PAID"|"VOIDED"]
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  contact_id(SHORT_TEXT)
  page(NUMBER)
  page_size(NUMBER)
  summary_only(CHECKBOX)=true
`xero_get_invoice_url` props:
  tenant_id★(DROPDOWN)
  invoice_id★(SHORT_TEXT) //Xero InvoiceID (GUID).
`xero_get_tax_rates` props:
  tenant_id★(DROPDOWN)
  tax_type(SHORT_TEXT) //Optional filter e.g. OUTPUT, INPUT, NONE.
  status(STATIC_DROPDOWN) ["Active"|"Deleted"]
`xero_get_tracking_categories` props:
  tenant_id★(DROPDOWN)
`xero_get_invoice_history` props:
  tenant_id★(DROPDOWN)
  invoice_id★(SHORT_TEXT) //Xero InvoiceID (GUID).
`xero_find_contact` props:
  tenant_id★(DROPDOWN)
  search_by★(STATIC_DROPDOWN)='NAME' ["Name (exact match)"|"Account Number (exact match)"|"Search Term (broad search)"]
  value★(SHORT_TEXT) //Name, Account Number, or Search Term depending on Search By.
  include_archived(CHECKBOX)=false
  summary_only(CHECKBOX)=true //Recommended for broad searches (Search Term). Excludes heavy
  page(NUMBER) //Pagination page (optional).
`xero_find_invoice` props:
  tenant_id★(DROPDOWN)
  search_by★(STATIC_DROPDOWN)='INVOICE_NUMBER' ["Invoice Number (exact)"|"Reference (exact)"|"Search Term (InvoiceNumber/Reference)"]
  value★(SHORT_TEXT) //Invoice Number, Reference, or Search Term.
  type_filter(STATIC_DROPDOWN) ["Sales Invoice (ACCREC)"|"Bill (ACCPAY)"]
  summary_only(CHECKBOX)=true
  page(NUMBER)
`xero_find_invoice_by_id` props:
  tenant_id★(DROPDOWN)
  invoice_id★(SHORT_TEXT) //Xero InvoiceID (GUID).
`xero_find_invoice_by_contact_id` props:
  tenant_id★(DROPDOWN)
  contact_id★(DROPDOWN) //Select a contact
  type(STATIC_DROPDOWN) ["All"|"Sales Invoice (ACCREC)"|"Bill (ACCPAY)"]
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"AUTHORISED"|"PAID"|"VOIDED"]
  page(NUMBER)
`xero_find_credit_note` props:
  tenant_id★(DROPDOWN)
  search_by★(STATIC_DROPDOWN)='NUMBER' ["Credit Note Number"|"Reference"|"Credit Note ID"]
  value★(SHORT_TEXT)
  status(STATIC_DROPDOWN) ["DRAFT"|"SUBMITTED"|"AUTHORISED"|"PAID"|"VOIDED"]
`xero_find_item` props:
  tenant_id★(DROPDOWN)
  search_by★(STATIC_DROPDOWN)='CODE' ["Code (exact)"|"Name (exact)"]
  value★(SHORT_TEXT) //Item Code or Name (exact match).
  order(SHORT_TEXT) //e.g. Name or Name DESC
`xero_find_employee` props:
  tenant_id★(DROPDOWN)
  search_by★(STATIC_DROPDOWN)='EMAIL' ["Email"|"Employee ID"]
  value★(SHORT_TEXT)
`xero_find_payment` props:
  tenant_id★(DROPDOWN)
  search_by★(STATIC_DROPDOWN)='ID' ["Payment ID"|"Reference"]
  value★(SHORT_TEXT)
`xero_find_purchase_order` props:
  tenant_id★(DROPDOWN)
  contact_id(DROPDOWN) //Select a contact
  search_by★(STATIC_DROPDOWN)='NUMBER' ["Purchase Order Number (exact)"|"Reference (exact)"|"Purchase Order ID (GUID)"]
  value★(SHORT_TEXT) //Number, Reference or ID depending on Search By.
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["Draft"|"Submitted"|"Authorised"|"Billed"|"Deleted"]
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  order(SHORT_TEXT)
  page(NUMBER)
  page_size(NUMBER)
`xero_find_quote` props:
  tenant_id★(DROPDOWN)
  quote_number(SHORT_TEXT)
  contact_id(SHORT_TEXT)
  status(STATIC_DROPDOWN) ["DRAFT"|"SENT"|"DECLINED"|"ACCEPTED"|"INVOICED"|"DELETED"]
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  page(NUMBER)
`xero_search_bank_transactions` props:
  tenant_id★(DROPDOWN)
  bank_account_id(DROPDOWN) //Select a bank account
  type(STATIC_DROPDOWN) ["Spend Money"|"Receive Money"|"Spend Overpayment"|"Receive Overpayment"|"Spend Prepayment"|"Receive Prepayment"]
  status(STATIC_DROPDOWN) ["AUTHORISED"|"DELETED"]
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  reference(SHORT_TEXT)
  page(NUMBER)
`xero_search_invoice` props:
  tenant_id★(DROPDOWN)
  search_term(SHORT_TEXT) //Searches across InvoiceNumber, Reference, and Contact Name.
  contact_id(SHORT_TEXT)
  type(STATIC_DROPDOWN) ["All"|"Sales Invoice (ACCREC)"|"Bill (ACCPAY)"]
  statuses(STATIC_MULTI_SELECT_DROPDOWN) ["DRAFT"|"AUTHORISED"|"PAID"|"VOIDED"]
  date_from(SHORT_TEXT)
  date_to(SHORT_TEXT)
  page(NUMBER)
`xero_search_contact_by_email` props:
  tenant_id★(DROPDOWN)
  search_by★(STATIC_DROPDOWN)='EMAIL' ["Email Address"|"Account Number"]
  value★(SHORT_TEXT)
  include_archived(CHECKBOX)=false
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### quickbooks  v2.0.1 | OAuth2
*Manage your business finances with Quickbooks Online. Automate invoice creation, track expenses, fin*
**Triggers:** `new_invoice` `new_expense` `new_customer` `new_deposit` `new_transfer` `new_account` `new_bill` `new_bill_payment` `new_bank_transaction` `new_credit_memo` `new_estimate` `new_invoice_due` `new_journal_entry` `new_paid_invoice` `new_payment` `new_product` `new_purchase_order` `new_refund_receipt` `new_sales_receipt` `new_supplier_credit` `new_time_entry` `new_vendor` `new_project` `updated_bill` `updated_credit_memo` `updated_customer` `updated_estimate` `updated_invoice` `estimate_emailed` `invoice_emailed`
**Actions:** `find_invoice` `find_customer` `find_payment` `create_invoice` `create_expense` `create_customer` `create_bill_account_based` `create_bill_item_based` `create_payment` `create_sales_receipt` `create_estimate` `create_vendor` `create_purchase_order` `create_credit_memo` `create_deposit` `create_employee` `create_journal_entry` `create_refund_receipt` `create_time_activity` `create_vendor_credit` `create_account` `create_product_service` `create_class` `update_invoice` `update_customer` `update_estimate` `update_vendor` `update_bill` `update_sales_receipt` `update_product` `update_purchase_expense` `send_invoice` `send_estimate` `send_sales_receipt` `void_invoice` `delete_invoice` `find_bill` `find_class` `find_estimate` `find_employee` `find_vendor` `find_product` `find_purchase_expense` `find_sales_receipt` `find_account` `get_invoice` `get_bill` `get_sales_receipt` `get_vendor_by_id` `get_all_taxes` `get_all_sales_terms` `list_items` `list_estimates` `get_attachments` `get_access_token` `custom_api_call`
`new_invoice_due` props:
  daysUntilDue★(NUMBER)=7 //Trigger when invoice is due within this many days.
`find_invoice` props:
  invoice_number★(SHORT_TEXT) //The document number (DocNumber) of the invoice to search for
`find_customer` props:
  search_term★(SHORT_TEXT) //The display name of the customer to search for.
`find_payment` props:
  customerId★(SHORT_TEXT) //The ID of the customer to find payments for.
`create_invoice` props:
  customerRef★(DROPDOWN)
  lineItems★(ARRAY) //Line items for the invoice
  emailStatus(STATIC_DROPDOWN)='NotSet' ["Not Set (Default - No Email)"|"Needs To Be Sent"] //Specify whether the invoice should be emailed after creation
  billEmail(SHORT_TEXT) //Email address to send the invoice to. Required if Email Stat
  dueDate(DATE_TIME) //The date when the payment for the invoice is due. If not pro
  docNumber(SHORT_TEXT) //Optional reference number for the invoice. If not provided, 
  txnDate(DATE_TIME) //The date entered on the transaction. Defaults to the current
  privateNote(LONG_TEXT) //Note to self. Does not appear on the invoice sent to the cus
  customerMemo(LONG_TEXT) //Memo to be displayed on the invoice sent to the customer (ap
`create_expense` props:
  accountRef★(DROPDOWN) //The account from which the expense was paid.
  paymentType★(STATIC_DROPDOWN)='Cash' ["Cash"|"Check"|"Credit Card"]
  entityRef(DROPDOWN) //Optional - The vendor the expense was paid to.
  txnDate(DATE_TIME) //The date the expense occurred.
  lineItems★(ARRAY) //Details of the expense (e.g., categories or items purchased)
  privateNote(LONG_TEXT) //Internal note about the expense.
`create_customer` props:
  displayName★(SHORT_TEXT) //The display name of the customer. Required.
  companyName(SHORT_TEXT)
  givenName(SHORT_TEXT)
  familyName(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  mobile(SHORT_TEXT)
  fax(SHORT_TEXT)
  billAddrLine1(SHORT_TEXT)
  billAddrCity(SHORT_TEXT)
  billAddrState(SHORT_TEXT)
  billAddrPostalCode(SHORT_TEXT)
  billAddrCountry(SHORT_TEXT)
  shipAddrLine1(SHORT_TEXT)
  shipAddrCity(SHORT_TEXT)
  shipAddrState(SHORT_TEXT)
  shipAddrPostalCode(SHORT_TEXT)
  shipAddrCountry(SHORT_TEXT)
  notes(LONG_TEXT)
  taxable(CHECKBOX)=false
  paymentMethodRef(SHORT_TEXT)
  salesTermRef(SHORT_TEXT)
  preferredDeliveryMethod(STATIC_DROPDOWN) ["Print"|"Email"|"None"]
  currencyCode(SHORT_TEXT) //e.g. USD, AUD, GBP
  openBalanceDate(SHORT_TEXT) //YYYY-MM-DD
  openBalance(NUMBER)
`create_bill_account_based` props:
  vendorRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  dueDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  lineItems★(ARRAY)
`create_bill_item_based` props:
  vendorRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  dueDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  lineItems★(ARRAY)
`create_payment` props:
  customerRef★(DROPDOWN)
  totalAmt★(NUMBER)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  paymentMethodRef(SHORT_TEXT)
  depositToAccountRef(SHORT_TEXT)
  memo(LONG_TEXT)
  linkedInvoiceId(SHORT_TEXT) //Leave blank to create an unlinked payment.
`create_sales_receipt` props:
  customerRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  emailStatus(STATIC_DROPDOWN)='NotSet' ["Not Set"|"Needs To Be Sent"]
  billEmail(SHORT_TEXT)
  depositToAccountRef(SHORT_TEXT)
  lineItems★(ARRAY)
`create_estimate` props:
  customerRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  expirationDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  emailStatus(STATIC_DROPDOWN)='NotSet' ["Not Set"|"Needs To Be Sent"]
  billEmail(SHORT_TEXT)
  txnStatus(STATIC_DROPDOWN) ["Accepted"|"Closed"|"Pending"|"Rejected"]
  lineItems★(ARRAY)
`create_vendor` props:
  displayName★(SHORT_TEXT)
  companyName(SHORT_TEXT)
  givenName(SHORT_TEXT)
  familyName(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  mobile(SHORT_TEXT)
  fax(SHORT_TEXT)
  billAddrLine1(SHORT_TEXT)
  billAddrCity(SHORT_TEXT)
  billAddrState(SHORT_TEXT)
  billAddrPostalCode(SHORT_TEXT)
  billAddrCountry(SHORT_TEXT)
  notes(LONG_TEXT)
  taxIdentifier(SHORT_TEXT)
  vendor1099(CHECKBOX)=false //Flag this vendor for 1099 reporting.
  currencyCode(SHORT_TEXT) //e.g. USD, AUD, GBP
  termRef(SHORT_TEXT)
`create_purchase_order` props:
  vendorRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  shipTo(SHORT_TEXT)
  lineItems★(ARRAY)
`create_credit_memo` props:
  customerRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  emailStatus(STATIC_DROPDOWN)='NotSet' ["Not Set"|"Needs To Be Sent"]
  billEmail(SHORT_TEXT)
  lineItems★(ARRAY)
`create_deposit` props:
  depositToAccountRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  memo(LONG_TEXT)
  totalAmt★(NUMBER)
  lineItems★(ARRAY)
`create_employee` props:
  givenName★(SHORT_TEXT)
  familyName★(SHORT_TEXT)
  displayName(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  mobile(SHORT_TEXT)
  addrLine1(SHORT_TEXT)
  addrCity(SHORT_TEXT)
  addrState(SHORT_TEXT)
  addrPostalCode(SHORT_TEXT)
  addrCountry(SHORT_TEXT)
  ssn(SHORT_TEXT)
  employeeType(STATIC_DROPDOWN) ["Regular"|"Officer"|"Statutory"]
  billableTime(CHECKBOX)=false
`create_journal_entry` props:
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  currencyCode(SHORT_TEXT) //e.g. USD, AUD
  lineItems★(ARRAY) //Journal entry lines. Debits must equal credits.
`create_refund_receipt` props:
  customerRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  depositToAccountRef(SHORT_TEXT)
  lineItems★(ARRAY)
`create_time_activity` props:
  nameof★(STATIC_DROPDOWN) ["Employee"|"Vendor"]
  employeeRef(SHORT_TEXT) //Required if Name Of is Employee.
  vendorRef(SHORT_TEXT) //Required if Name Of is Vendor.
  customerRef★(DROPDOWN)
  itemRef(SHORT_TEXT)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  hours(NUMBER)
  minutes(NUMBER)
  description(LONG_TEXT)
  billableStatus(STATIC_DROPDOWN) ["Billable"|"Not Billable"|"Has Been Billed"]
  hourlyRate(NUMBER)
`create_vendor_credit` props:
  vendorRef★(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  lineItems★(ARRAY)
`create_account` props:
  name★(SHORT_TEXT)
  accountType★(STATIC_DROPDOWN)
  accountSubType(SHORT_TEXT) //Optional sub-type for the account.
  description(LONG_TEXT)
  taxCodeRef(SHORT_TEXT)
  currencyCode(SHORT_TEXT) //e.g. USD, AUD
  openingBalance(NUMBER)
  openingBalanceDate(SHORT_TEXT) //YYYY-MM-DD
`create_product_service` props:
  name★(SHORT_TEXT)
  type★(STATIC_DROPDOWN) ["Inventory"|"Non-Inventory"|"Service"]
  description(LONG_TEXT)
  purchaseDescription(LONG_TEXT)
  salesPrice(NUMBER)
  purchaseCost(NUMBER)
  incomeAccountRef(SHORT_TEXT)
  expenseAccountRef(SHORT_TEXT)
  assetAccountRef(SHORT_TEXT) //Required for Inventory type items.
  qtyOnHand(NUMBER) //Required for Inventory type.
  invStartDate(SHORT_TEXT) //YYYY-MM-DD. Required for Inventory type.
  active(CHECKBOX)=true
`create_class` props:
  name★(SHORT_TEXT)
  subClass(CHECKBOX)=false //Mark as sub-class of a parent class.
  parentRef(SHORT_TEXT) //Required if marking as sub-class.
`update_invoice` props:
  invoiceId★(SHORT_TEXT)
  customerRef(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  dueDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  emailStatus(STATIC_DROPDOWN) ["Not Set"|"Needs To Be Sent"]
  billEmail(SHORT_TEXT)
  memo(LONG_TEXT)
  customerMemo(LONG_TEXT)
`update_customer` props:
  customerId★(DROPDOWN)
  displayName(SHORT_TEXT)
  companyName(SHORT_TEXT)
  givenName(SHORT_TEXT)
  familyName(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  notes(LONG_TEXT)
  active(CHECKBOX)=true
`update_estimate` props:
  estimateId★(SHORT_TEXT)
  customerRef(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  expirationDate(SHORT_TEXT) //YYYY-MM-DD
  txnStatus(STATIC_DROPDOWN) ["Accepted"|"Closed"|"Pending"|"Rejected"]
  emailStatus(STATIC_DROPDOWN) ["Not Set"|"Needs To Be Sent"]
  billEmail(SHORT_TEXT)
  memo(LONG_TEXT)
`update_vendor` props:
  vendorId★(DROPDOWN)
  displayName(SHORT_TEXT)
  companyName(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  notes(LONG_TEXT)
  active(CHECKBOX)=true
`update_bill` props:
  billId★(SHORT_TEXT)
  vendorRef(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  dueDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
`update_sales_receipt` props:
  salesReceiptId★(SHORT_TEXT)
  customerRef(DROPDOWN)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  emailStatus(STATIC_DROPDOWN) ["Not Set"|"Needs To Be Sent"]
  billEmail(SHORT_TEXT)
`update_product` props:
  itemId★(SHORT_TEXT)
  name(SHORT_TEXT)
  description(LONG_TEXT)
  salesPrice(NUMBER)
  purchaseCost(NUMBER)
  active(CHECKBOX)=true
`update_purchase_expense` props:
  purchaseId★(SHORT_TEXT)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  docNumber(SHORT_TEXT)
  memo(LONG_TEXT)
  totalAmt(NUMBER)
`send_invoice` props:
  invoiceId★(SHORT_TEXT)
  sendTo(SHORT_TEXT) //Email address to send to. Leave blank to use the customer de
`send_estimate` props:
  estimateId★(SHORT_TEXT)
  sendTo(SHORT_TEXT) //Email address to send to. Leave blank to use the customer de
`send_sales_receipt` props:
  salesReceiptId★(SHORT_TEXT)
  sendTo(SHORT_TEXT) //Email address to send to. Leave blank to use the customer de
`void_invoice` props:
  invoiceId★(SHORT_TEXT)
`delete_invoice` props:
  invoiceId★(SHORT_TEXT)
`find_bill` props:
  docNumber★(SHORT_TEXT)
`find_class` props:
  name★(SHORT_TEXT)
`find_estimate` props:
  docNumber★(SHORT_TEXT)
`find_employee` props:
  displayName★(SHORT_TEXT)
`find_vendor` props:
  displayName★(SHORT_TEXT)
`find_product` props:
  name★(SHORT_TEXT)
`find_purchase_expense` props:
  docNumber(SHORT_TEXT)
  vendorId(SHORT_TEXT)
  txnDate(SHORT_TEXT) //YYYY-MM-DD
  minAmount(NUMBER)
  maxAmount(NUMBER)
`find_sales_receipt` props:
  docNumber★(SHORT_TEXT)
`find_account` props:
  name★(SHORT_TEXT)
`get_invoice` props:
  invoiceId★(SHORT_TEXT)
`get_bill` props:
  billId★(SHORT_TEXT)
`get_sales_receipt` props:
  salesReceiptId★(SHORT_TEXT)
`get_vendor_by_id` props:
  vendorId★(SHORT_TEXT)
`list_items` props:
  type(STATIC_DROPDOWN)='All' ["All"|"Inventory"|"Non-Inventory"|"Service"]
  active(STATIC_DROPDOWN)='Active' ["Active"|"Inactive"|"All"]
`list_estimates` props:
  customerId(SHORT_TEXT) //Filter by customer ID. Leave blank for all customers.
  status(STATIC_DROPDOWN)='All' ["All"|"Accepted"|"Closed"|"Pending"|"Rejected"]
`get_attachments` props:
  entityType★(STATIC_DROPDOWN) ["Invoice"|"Bill"|"Estimate"|"Sales Receipt"|"Payment"|"Purchase Order"|"Expense"]
  entityId★(SHORT_TEXT)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### square  v2.0.0 | OAuth2
*Payment solutions for every business*
**Triggers:** `new_order` `order_updated` `new_customer` `customer_updated` `new_appointment` `new_payment` `new_invoice`

### invoiceninja  v2.0.0 | Custom(base_url,access_token)
*Free open-source invoicing tool*
**Actions:** `create_task` `exists_task` `getclient_task` `getinvoices_task` `getreport_task` `create_invoice` `create_client` `create_recurring_invoice` `action_recurring_invoice` `custom_api_call`

### zoho-books  v2.0.3 | OAuth2
*Comprehensive online accounting software for small businesses.*
**Triggers:** `new_customer` `new_estimate` `new_expense` `new_sales_invoice` `new_item` `new_bill` `new_vendor` `new_credit_note` `new_customer_payment` `new_project` `new_timesheet` `new_recurring_expense` `new_recurring_invoice`
**Actions:** `create_sales_customer` `create_item` `create_estimate` `create_sales_invoice` `create_contact` `create_contact_person` `create_sales_order` `create_expense` `create_employee` `create_credit_note` `create_payment` `create_bill` `create_purchase_order` `create_vendor_payment` `get_contact_by_id` `get_contact_person` `get_estimate` `get_contact_person_by_contact_id` `get_employee` `get_item_by_name` `get_invoice` `update_contact_person` `update_contact` `update_sales_invoice` `update_item` `update_sales_order` `update_purchase_order` `update_payment` `update_expense` `update_estimate` `update_bill` `update_vendor_payment` `delete_contact` `delete_invoice` `delete_item` `delete_estimate` `delete_employee` `add_attachment_to_invoice` `email_invoice` `find_invoice` `find_bill` `list_currencies` `list_active_accounts` `list_contacts` `list_bill_field_details` `list_contact_persons` `list_bill_payments` `list_all_locations` `custom_api_request_beta` `custom_api_call`
`new_customer` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new customers (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_estimate` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new estimates (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_expense` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new expenses (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_sales_invoice` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new sales invoices (default
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_item` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new items (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_bill` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new bills (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_vendor` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new vendors (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_credit_note` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new credit notes (default: 
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_customer_payment` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new customer payments (defa
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_project` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new projects (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_timesheet` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new timesheets (default: 72
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_recurring_expense` props:
  lookbackHours(NUMBER)=72 //How many hours back to check for new recurring expenses (def
  debugMode(CHECKBOX)=false //Enable detailed logging for troubleshooting
`new_recurring_invoice` props:
  lookbackHours(NUMBER)=72 //Hours back to check for new recurring invoices (default: 72)
  debugMode(CHECKBOX)=false //Enable detailed logging
`create_sales_customer` props:
  organization_id(SHORT_TEXT) //Your Zoho Books Organization ID (leave empty to auto-detect 
  contact_name★(SHORT_TEXT) //Full name or company name of the customer
  company_name(SHORT_TEXT) //Company name (if different from contact name)
  website(SHORT_TEXT) //Customer website URL
  language_code(SHORT_TEXT) //Language code for the customer
  contact_type(STATIC_DROPDOWN)='customer' ["Customer"|"Vendor"|"Both"] //Type of contact
  customer_sub_type(STATIC_DROPDOWN) ["Business"|"Individual"] //Sub type of customer
  credit_limit(NUMBER) //Credit limit for the customer
  contact_number(SHORT_TEXT) //Custom contact number (leave empty for auto-generation)
  notes(LONG_TEXT) //Additional notes about the customer
  billing_attention(SHORT_TEXT) //Attention field for billing address
  billing_address(LONG_TEXT) //Street address for billing
  billing_street2(SHORT_TEXT) //Second line of billing address
  billing_city(SHORT_TEXT) //City for billing address
  billing_state(SHORT_TEXT) //State for billing address
  billing_state_code(SHORT_TEXT) //State code for billing address
  billing_zip(SHORT_TEXT) //ZIP code for billing address
  billing_country(SHORT_TEXT) //Country for billing address
  billing_phone(SHORT_TEXT) //Phone number for billing address
  billing_fax(SHORT_TEXT) //Fax number for billing address
  shipping_attention(SHORT_TEXT) //Attention field for shipping address
  shipping_address(LONG_TEXT) //Street address for shipping
  shipping_street2(SHORT_TEXT) //Second line of shipping address
  shipping_city(SHORT_TEXT) //City for shipping address
  shipping_state(SHORT_TEXT) //State for shipping address
  shipping_state_code(SHORT_TEXT) //State code for shipping address
  shipping_zip(SHORT_TEXT) //ZIP code for shipping address
  shipping_country(SHORT_TEXT) //Country for shipping address
  shipping_phone(SHORT_TEXT) //Phone number for shipping address
  shipping_fax(SHORT_TEXT) //Fax number for shipping address
  contact_persons(LONG_TEXT) //Contact persons as JSON array. Example: [{"first_name":"John
  payment_terms(NUMBER) //Payment terms in days (e.g., 15 for Net 15)
  payment_terms_label(SHORT_TEXT) //Label for payment terms (e.g., "Net 15")
  currency_id(NUMBER) //Currency ID for the customer
  pricebook_id(NUMBER) //Pricebook ID for the customer
  is_portal_enabled(CHECKBOX) //Enable customer portal for this customer
`create_item` props:
  organization_id(SHORT_TEXT) //Your Zoho Books Organization ID (leave empty to auto-detect)
  name★(SHORT_TEXT) //Name of the item. Example: Hard Drive
  description(LONG_TEXT) //Add item description here. Example: 500GB
  product_type(STATIC_DROPDOWN)='goods' ["Goods"|"Service"|"Digital Service"] //Specify the type of item.
  sku(SHORT_TEXT) //SKU value of item, must be unique. Ex - s12345
  rate★(NUMBER) //Price of the item. Ex - 120
  tax_id(SHORT_TEXT) //ID of the tax to be associated to the item. Not applicable f
  tax_percentage(NUMBER) //Tax applied on the item (e.g., 18 for 18%).
  item_type(STATIC_DROPDOWN)='sales' ["Sales"|"Purchases"|"Sales and Purchases"|"Inventory"] //How this item is used in transactions.
  account_id(SHORT_TEXT) //Optional account_id to associate the item with (from Chart o
  locations(LONG_TEXT) //JSON array of locations with location_id, initial_stock, ini
  purchase_tax_rule_id(SHORT_TEXT)
  sales_tax_rule_id(SHORT_TEXT)
  hsn_or_sac(SHORT_TEXT)
  sat_item_key_code(SHORT_TEXT)
  unitkey_code(SHORT_TEXT)
  is_taxable(CHECKBOX)=true
  tax_exemption_id(SHORT_TEXT)
  purchase_tax_exemption_id(SHORT_TEXT)
  avatax_tax_code(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  purchase_description(LONG_TEXT)
  purchase_rate(SHORT_TEXT)
  purchase_account_id(SHORT_TEXT)
  inventory_account_id(SHORT_TEXT)
  vendor_id(SHORT_TEXT)
  reorder_level(SHORT_TEXT)
  item_tax_preferences(LONG_TEXT)
  custom_fields(LONG_TEXT)
`create_estimate` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  customer_id★(SHORT_TEXT) //ID of the customer (contact) for whom the estimate is create
  currency_id(SHORT_TEXT) //Currency ID for the estimate (from Currencies API).
  contact_persons_associated(LONG_TEXT) //JSON array of contact persons associated with this estimate,
  template_id(SHORT_TEXT) //Estimate template ID (from GET /estimates/templates).
  place_of_supply(SHORT_TEXT)
  gst_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  estimate_number(SHORT_TEXT) //Unique identifier for the estimate. Required when ignore_aut
  reference_number(SHORT_TEXT)
  date★(SHORT_TEXT)
  expiry_date(SHORT_TEXT)
  exchange_rate(NUMBER)
  discount(NUMBER)
  is_discount_before_tax(CHECKBOX)=true
  discount_type(STATIC_DROPDOWN)='item_level' ["Entity Level"|"Item Level"]
  is_inclusive_tax(CHECKBOX)=false
  custom_body(LONG_TEXT)
  custom_subject(SHORT_TEXT)
  salesperson_name(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  line_items★(LONG_TEXT) //JSON array of line items in the Estimates API format.
  location_id(SHORT_TEXT) //Business location ID for the estimate.
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  shipping_charge(SHORT_TEXT)
  adjustment(NUMBER)
  adjustment_description(SHORT_TEXT)
  tax_id(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  is_reverse_charge_applied(CHECKBOX)=false
  accept_retainer(CHECKBOX)=false
  retainer_percentage(NUMBER)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
  send(CHECKBOX)=false
  ignore_auto_number_generation(CHECKBOX)=false
`create_sales_invoice` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  customer_id★(SHORT_TEXT) //Unique identifier of the customer for whom the invoice is cr
  currency_id(SHORT_TEXT) //Currency ID for the invoice (from Currencies API).
  contact_persons(LONG_TEXT) //Example: ["982000000870911","982000000870915"]
  contact_persons_associated(LONG_TEXT) //JSON array of contact person objects with communication pref
  invoice_number(SHORT_TEXT) //Custom invoice number (requires ignore_auto_number_generatio
  place_of_supply(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  is_reverse_charge_applied(CHECKBOX)=false
  gst_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  cfdi_usage(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  template_id(SHORT_TEXT) //PDF template ID from GET /invoices/templates.
  date★(SHORT_TEXT)
  payment_terms(NUMBER)
  payment_terms_label(SHORT_TEXT)
  due_date(SHORT_TEXT)
  discount(NUMBER) //Discount amount or percentage. Applied based on is_discount_
  is_discount_before_tax(CHECKBOX)=true
  discount_type(STATIC_DROPDOWN)='item_level' ["Entity Level"|"Item Level"]
  is_inclusive_tax(CHECKBOX)=false
  exchange_rate(NUMBER)
  location_id(SHORT_TEXT)
  recurring_invoice_id(SHORT_TEXT)
  invoiced_estimate_id(SHORT_TEXT)
  salesperson_name(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
  send(CHECKBOX)=false
  line_items★(LONG_TEXT) //JSON array of invoice line items. See Zoho Books Invoices AP
  payment_options(LONG_TEXT) //Payment options object (payment_gateways, bank accounts, etc
  allow_partial_payments(CHECKBOX)=false
  custom_body(LONG_TEXT)
  custom_subject(SHORT_TEXT)
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  shipping_charge(SHORT_TEXT)
  adjustment(NUMBER)
  adjustment_description(SHORT_TEXT)
  reason(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  billing_address_id(SHORT_TEXT)
  shipping_address_id(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  tax_id(SHORT_TEXT)
  expense_id(SHORT_TEXT)
  salesorder_item_id(SHORT_TEXT)
  avatax_tax_code(SHORT_TEXT)
  time_entry_ids(LONG_TEXT)
  batch_payments(LONG_TEXT) //Array of batch payment details. Note: is_quick_create must b
  ignore_auto_number_generation(CHECKBOX)=false
  is_quick_create(CHECKBOX)=false
  enable_batch_payments(CHECKBOX)=false
`create_contact` props:
  organization_id(SHORT_TEXT) //Your Zoho Books Organization ID (leave empty to auto-detect)
  contact_name★(SHORT_TEXT) //Display name for the contact (used for search and display).
  company_name(SHORT_TEXT) //Legal or registered company name. Used in documents and form
  website(SHORT_TEXT) //Official website URL of the contact.
  language_code(STATIC_DROPDOWN)
  contact_type(STATIC_DROPDOWN)='customer' ["Customer"|"Vendor"]
  customer_sub_type(STATIC_DROPDOWN) ["Business"|"Individual"]
  credit_limit(NUMBER) //Maximum credit amount allowed for this customer.
  pricebook_id(SHORT_TEXT) //Pricebook associated with the contact.
  contact_number(SHORT_TEXT) //Internal contact number identifier.
  ignore_auto_number_generation(CHECKBOX)=false
  email(SHORT_TEXT) //Primary email address.
  phone(SHORT_TEXT) //Phone number.
  mobile(SHORT_TEXT) //Mobile number.
  is_portal_enabled(CHECKBOX)=false
  currency_id(SHORT_TEXT) //Currency ID assigned to this contact.
  payment_terms(NUMBER)
  payment_terms_label(SHORT_TEXT)
  notes(LONG_TEXT) //Additional comments or notes about the contact.
  billing_address(LONG_TEXT) //JSON: {"attention":"Mr.John","address":"4900 Hopyard Rd","st
  shipping_address(LONG_TEXT) //JSON: {"attention":"Mr.John","address":"4900 Hopyard Rd","st
  contact_persons(LONG_TEXT) //JSON array matching Zoho Books format. Example: [{"salutatio
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460000000000
  default_templates(LONG_TEXT) //JSON object for default templates as per Zoho Books Contacts
  custom_fields(LONG_TEXT) //JSON array of custom fields. Example: [{"index":1,"value":"G
  opening_balances(LONG_TEXT) //JSON array of opening balances. Example: [{"location_id":"46
  vat_reg_no(SHORT_TEXT)
  owner_id(SHORT_TEXT)
  tax_reg_no(SHORT_TEXT)
  tax_exemption_certificate_number(SHORT_TEXT)
  country_code(SHORT_TEXT) //Two-letter country code or UAE emirate code.
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  tax_regime(SHORT_TEXT)
  legal_name(SHORT_TEXT)
  is_tds_registered(CHECKBOX)=false
  place_of_contact(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  gst_treatment(SHORT_TEXT)
  tax_authority_name(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  tax_exemption_code(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  tax_id(SHORT_TEXT)
  tds_tax_id(SHORT_TEXT)
  is_taxable(CHECKBOX)=false
  facebook(SHORT_TEXT)
  twitter(SHORT_TEXT)
  track_1099(CHECKBOX)=false
  tax_id_type(SHORT_TEXT) //SSN, ATIN, ITIN or EIN.
  tax_id_value(SHORT_TEXT)
`create_contact_person` props:
  organization_id(SHORT_TEXT) //Your Zoho Books Organization ID (leave empty to auto-detect)
  contact_id★(SHORT_TEXT) //Contact id of the contact.
  salutation(SHORT_TEXT) //e.g. Mr, Ms, Dr.
  first_name★(SHORT_TEXT)
  last_name(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  mobile(SHORT_TEXT)
  skype(SHORT_TEXT)
  designation(SHORT_TEXT) //Job title / designation.
  department(SHORT_TEXT)
  enable_portal(CHECKBOX)=false
  is_primary_contact(CHECKBOX)=false
  communication_preference_is_sms_enabled(CHECKBOX)=false
  communication_preference_is_whatsapp_enabled(CHECKBOX)=false
`create_sales_order` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  customer_id★(SHORT_TEXT) //Unique identifier for the customer receiving the sales order
  currency_id(SHORT_TEXT)
  contact_persons_associated(LONG_TEXT) //JSON array of contact persons associated with this sales ord
  date★(SHORT_TEXT)
  shipment_date(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
  place_of_supply(SHORT_TEXT)
  salesperson_id(SHORT_TEXT)
  merchant_id(SHORT_TEXT)
  gst_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  is_inclusive_tax(CHECKBOX)=false
  location_id(SHORT_TEXT)
  line_items★(LONG_TEXT) //JSON array of line items for the sales order.
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  billing_address_id(SHORT_TEXT)
  shipping_address_id(SHORT_TEXT)
  crm_owner_id(SHORT_TEXT)
  crm_custom_reference_id(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  is_reverse_charge_applied(CHECKBOX)=false
  salesorder_number(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  is_update_customer(CHECKBOX)=false
  discount(SHORT_TEXT) //Discount value, as percentage or amount, e.g. "10%" or "190"
  exchange_rate(NUMBER)
  salesperson_name(SHORT_TEXT)
  notes_default(LONG_TEXT)
  terms_default(LONG_TEXT)
  tax_id(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  tax_authority_name(SHORT_TEXT)
  tax_exemption_code(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  shipping_charge(NUMBER)
  adjustment(NUMBER)
  delivery_method(SHORT_TEXT)
  estimate_id(SHORT_TEXT)
  is_discount_before_tax(CHECKBOX)=true
  discount_type(STATIC_DROPDOWN)='entity_level' ["Entity Level"|"Item Level"]
  adjustment_description(SHORT_TEXT)
  pricebook_id(SHORT_TEXT)
  template_id(SHORT_TEXT)
  documents(LONG_TEXT) //Array of documents attached to the sales order.
  zcrm_potential_id(SHORT_TEXT)
  zcrm_potential_name(SHORT_TEXT)
  ignore_auto_number_generation(CHECKBOX)=false
`create_expense` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  account_id★(SHORT_TEXT) //ID of the expense account.
  paid_through_account_id★(SHORT_TEXT) //Account used to pay the expense.
  date★(SHORT_TEXT)
  amount★(NUMBER)
  tax_id(SHORT_TEXT)
  source_of_supply(SHORT_TEXT)
  destination_of_supply(SHORT_TEXT)
  place_of_supply(SHORT_TEXT)
  hsn_or_sac(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  reverse_charge_tax_id(SHORT_TEXT)
  location_id(SHORT_TEXT)
  line_items(LONG_TEXT) //JSON array of expense line items.
  taxes(LONG_TEXT)
  is_inclusive_tax(CHECKBOX)=false
  is_billable(CHECKBOX)=false
  reference_number(SHORT_TEXT) //Reference number of the expense.
  description(LONG_TEXT)
  customer_id(SHORT_TEXT)
  currency_id(SHORT_TEXT)
  exchange_rate(NUMBER)
  project_id(SHORT_TEXT)
  mileage_type(SHORT_TEXT) //e.g. non_mileage, odometer, manual
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  product_type(SHORT_TEXT)
  acquisition_vat_id(SHORT_TEXT)
  reverse_charge_vat_id(SHORT_TEXT)
  start_reading(NUMBER)
  end_reading(NUMBER)
  distance(SHORT_TEXT)
  mileage_unit(SHORT_TEXT) //km or mile
  mileage_rate(NUMBER)
  employee_id(SHORT_TEXT)
  vehicle_type(SHORT_TEXT)
  can_reclaim_vat_on_mileage(SHORT_TEXT)
  fuel_type(SHORT_TEXT)
  engine_capacity_range(SHORT_TEXT)
  vendor_id(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
`create_employee` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  name★(SHORT_TEXT) //Employee name.
  email★(SHORT_TEXT) //Employee email address.
  employee_id(SHORT_TEXT)
  designation(SHORT_TEXT)
  department(SHORT_TEXT)
  mobile(SHORT_TEXT)
  is_hourly_payment(CHECKBOX)=false
  currency_id(SHORT_TEXT)
`create_credit_note` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  customer_id★(SHORT_TEXT) //Unique customer_id for whom the credit note is created.
  currency_id(SHORT_TEXT) //Optional currency_id (from Currencies API).
  contact_persons_associated(LONG_TEXT) //JSON array of contact persons associated with this transacti
  date★(SHORT_TEXT) //Date the credit note is raised.
  is_draft(CHECKBOX)=true
  exchange_rate(SHORT_TEXT) //String exchange rate when currency differs from base currenc
  line_items★(LONG_TEXT) //JSON array of line items as per Credit Notes API. Example: [
  location_id(SHORT_TEXT) //Business location ID associated with the credit note.
  creditnote_number(SHORT_TEXT) //Unique credit note number. Required when ignore_auto_number_
  gst_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  is_reverse_charge_applied(CHECKBOX)=false
  gst_no(SHORT_TEXT)
  cfdi_usage(SHORT_TEXT)
  cfdi_reference_type(SHORT_TEXT)
  place_of_supply(SHORT_TEXT)
  ignore_auto_number_generation(CHECKBOX)=false
  reference_number(SHORT_TEXT) //Optional reference number for tracking (e.g. linked invoice)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  template_id(SHORT_TEXT) //Credit note PDF template ID.
  tax_id(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  is_inclusive_tax(CHECKBOX)=false
  avatax_tax_code(SHORT_TEXT)
  invoice_id(SHORT_TEXT) //Optional invoice_id query param for some credit note flows.
`create_payment` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  customer_id★(SHORT_TEXT) //Customer ID of the customer involved in the payment.
  payment_mode★(STATIC_DROPDOWN) ["Cash"|"Check"|"Credit Card"|"Bank Transfer"|"Bank Remittance"|"Auto Transaction"|"Others"]
  amount★(NUMBER) //Amount paid in the respective payment.
  date★(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  description(LONG_TEXT)
  invoices★(LONG_TEXT) //JSON array of invoices associated with the payment. Example:
  exchange_rate(NUMBER)
  payment_form(SHORT_TEXT) //Mode of vendor payment (MX only).
  bank_charges(NUMBER)
  custom_fields(LONG_TEXT)
  location_id(SHORT_TEXT)
  invoice_id(SHORT_TEXT) //If provided along with Amount Applied, will construct invoic
  amount_applied(NUMBER)
  tax_amount_withheld(NUMBER)
  account_id(SHORT_TEXT)
  contact_persons(LONG_TEXT) //Example: ["982000000870911","982000000870915"]
  retainerinvoice_id(SHORT_TEXT)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
`create_bill` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  vendor_id★(SHORT_TEXT) //Unique vendor_id from Zoho Books Contacts API.
  currency_id(SHORT_TEXT) //Optional currency_id from Currencies API.
  bill_number★(SHORT_TEXT) //Unique bill number from the vendor invoice. Must be unique w
  reference_number(SHORT_TEXT) //External reference from vendor invoice or PO.
  date★(SHORT_TEXT)
  due_date(SHORT_TEXT)
  payment_terms(NUMBER) //0 = Due on Receipt, 15 = Net 15, etc.
  payment_terms_label(SHORT_TEXT)
  pricebook_id(SHORT_TEXT) //Optional pricebook_id for item pricing.
  gst_treatment(SHORT_TEXT) //India only. Example: business_gst, business_none, overseas, 
  tax_treatment(SHORT_TEXT) //GCC/MX/KE/ZA only. Example: vat_registered, vat_not_register
  gst_no(SHORT_TEXT) //India only. 15-digit GSTIN of the vendor.
  location_id(SHORT_TEXT) //Location ID from Locations API (required for multi-location 
  exchange_rate(NUMBER) //Required when bill currency differs from organization base c
  is_item_level_tax_calc(CHECKBOX)=false
  is_inclusive_tax(CHECKBOX)=false
  adjustment(NUMBER) //Positive to increase total, negative to reduce total.
  adjustment_description(SHORT_TEXT)
  purchaseorder_ids(LONG_TEXT) //Optional JSON array of purchase order IDs linked to this bil
  line_items★(LONG_TEXT) //JSON array of line items matching Zoho Books Bills API forma
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  custom_fields(LONG_TEXT)
`create_purchase_order` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  vendor_id★(SHORT_TEXT) //Unique identifier of the vendor for whom the purchase order 
  currency_id(SHORT_TEXT) //Currency ID for the purchase order (from Currencies API).
  contact_persons_associated(LONG_TEXT) //JSON array of contact persons associated with this purchase 
  purchaseorder_number(SHORT_TEXT) //Unique identifier for the purchase order. Required when auto
  gst_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  source_of_supply(SHORT_TEXT)
  destination_of_supply(SHORT_TEXT)
  place_of_supply(SHORT_TEXT)
  pricebook_id(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  billing_address_id(SHORT_TEXT)
  crm_owner_id(SHORT_TEXT)
  crm_custom_reference_id(NUMBER)
  template_id(SHORT_TEXT) //PDF template ID from GET /purchaseorders/templates.
  date★(SHORT_TEXT) //Date the purchase order is created.
  delivery_date(SHORT_TEXT)
  due_date(SHORT_TEXT)
  exchange_rate(NUMBER)
  discount(SHORT_TEXT) //Discount amount or percentage (as string).
  discount_account_id(SHORT_TEXT)
  is_discount_before_tax(CHECKBOX)=true
  is_inclusive_tax(CHECKBOX)=false
  notes(LONG_TEXT)
  notes_default(LONG_TEXT)
  terms(LONG_TEXT)
  terms_default(LONG_TEXT)
  ship_via(SHORT_TEXT)
  delivery_org_address_id(SHORT_TEXT)
  delivery_customer_id(SHORT_TEXT)
  attention(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  is_update_customer(SHORT_TEXT)
  salesorder_id(SHORT_TEXT)
  location_id(SHORT_TEXT)
  line_items★(LONG_TEXT) //JSON array of line items for the purchase order.
  custom_fields(LONG_TEXT)
  documents(LONG_TEXT)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
  ignore_auto_number_generation(CHECKBOX)=false
`create_vendor_payment` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  vendor_id(SHORT_TEXT) //ID of the vendor associated with the vendor payment.
  bills(LONG_TEXT) //Array of bill payment details, e.g. [{"bill_payment_id":"...
  date(SHORT_TEXT)
  exchange_rate(NUMBER)
  amount★(NUMBER) //Total amount of the vendor payment.
  paid_through_account_id(SHORT_TEXT) //ID of the cash/bank account from which the payment is made.
  payment_mode(SHORT_TEXT) //Mode of vendor payment, e.g. Cash, Stripe.
  description(LONG_TEXT)
  reference_number(SHORT_TEXT)
  check_details(LONG_TEXT)
  is_paid_via_print_check(CHECKBOX)=false
  location_id(SHORT_TEXT)
  tags(LONG_TEXT) //Reporting tags JSON array. Example: [{"tag_id":"460...","tag
  custom_fields(LONG_TEXT)
`get_contact_by_id` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  contact_id★(SHORT_TEXT) //Unique identifier of the contact.
`get_contact_person` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  contact_id★(SHORT_TEXT) //Unique identifier of the contact that owns this contact pers
  contact_person_id★(SHORT_TEXT) //Unique identifier of the contact person to retrieve.
`get_estimate` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  estimate_id★(SHORT_TEXT) //Unique identifier of the estimate to retrieve.
  print(CHECKBOX) //If true, returns the printable PDF version of the estimate.
  accept(STATIC_DROPDOWN) ["JSON"|"PDF"|"HTML"] //Get the estimate in JSON, PDF, or HTML format. Default is JS
`get_contact_person_by_contact_id` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  contact_id★(SHORT_TEXT) //Unique identifier of the contact whose contact persons you w
  page(NUMBER) //Page number to fetch (default 1).
  per_page(NUMBER) //Number of records per page (default 200, max 200).
`get_employee` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  employee_id★(SHORT_TEXT) //Unique identifier of the employee to retrieve.
`get_item_by_name` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  name(SHORT_TEXT) //Filter items by exact name. For partial matches, use search 
  description(SHORT_TEXT)
  rate(SHORT_TEXT) //Filter items by rate. For range filters, use explicit varian
  tax_id(SHORT_TEXT)
  tax_name(SHORT_TEXT)
  is_taxable(CHECKBOX) //Track whether the item is taxable (supported in specific edi
  tax_exemption_id(SHORT_TEXT)
  account_id(SHORT_TEXT)
  filter_by(SHORT_TEXT) //Status.All, Status.Active, or Status.Inactive.
  search_text(SHORT_TEXT) //Search items by name or description.
  sort_column(SHORT_TEXT) //name, rate, or tax_name.
  sat_item_key_code(SHORT_TEXT)
  unitkey_code(SHORT_TEXT)
  page(NUMBER) //Page number to fetch (default 1).
  per_page(NUMBER) //Number of records per page (default 200, max 200).
`get_invoice` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  invoice_id★(SHORT_TEXT) //Unique identifier of the invoice to retrieve.
  print(CHECKBOX) //If true, returns the printable PDF version of the invoice.
  accept(STATIC_DROPDOWN) ["JSON"|"PDF"|"HTML"] //Get the invoice in JSON, PDF, or HTML format. Default is JSO
`update_contact_person` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  contact_id★(SHORT_TEXT) //ID of the parent contact this person belongs to.
  contact_person_id★(DROPDOWN) //Select the contact person to update.
  salutation(SHORT_TEXT)
  first_name★(SHORT_TEXT) //First name of the contact person.
  last_name(SHORT_TEXT)
  email(SHORT_TEXT)
  phone(SHORT_TEXT)
  mobile(SHORT_TEXT)
  skype(SHORT_TEXT)
  designation(SHORT_TEXT)
  department(SHORT_TEXT)
  enable_portal(CHECKBOX)
  communication_preference(LONG_TEXT) //JSON object specifying communication preferences, e.g. {"is_
`update_contact` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  contact_id★(SHORT_TEXT) //Unique identifier of the contact to update.
  contact_name★(SHORT_TEXT) //Display name used for searching and displaying contacts.
  company_name(SHORT_TEXT)
  payment_terms(NUMBER)
  payment_terms_label(SHORT_TEXT)
  contact_type(STATIC_DROPDOWN) ["Customer"|"Vendor"]
  customer_sub_type(STATIC_DROPDOWN) ["Individual"|"Business"]
  currency_id(SHORT_TEXT)
  opening_balances(LONG_TEXT) //JSON array of opening balance objects with location and amou
  credit_limit(NUMBER)
  pricebook_id(SHORT_TEXT)
  contact_number(SHORT_TEXT)
  ignore_auto_number_generation(CHECKBOX)
  tags(LONG_TEXT)
  website(SHORT_TEXT)
  owner_id(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  billing_address(LONG_TEXT)
  shipping_address(LONG_TEXT)
  contact_persons(LONG_TEXT) //JSON array of contact person objects. To remove a person, ex
  default_templates(LONG_TEXT)
  notes(LONG_TEXT)
  vat_reg_no(SHORT_TEXT)
  tax_reg_no(SHORT_TEXT)
  country_code(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  tax_exemption_certificate_number(SHORT_TEXT)
  tax_regime(SHORT_TEXT)
  legal_name(SHORT_TEXT)
  is_tds_registered(CHECKBOX)
  vat_treatment(SHORT_TEXT)
  place_of_contact(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  gst_treatment(SHORT_TEXT)
  tax_authority_name(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  tax_exemption_code(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  tax_id(SHORT_TEXT)
  is_taxable(CHECKBOX)
  facebook(SHORT_TEXT)
  twitter(SHORT_TEXT)
  track_1099(CHECKBOX)
  tax_id_type(SHORT_TEXT)
  tax_id_value(SHORT_TEXT)
`update_sales_invoice` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  invoice_id★(SHORT_TEXT) //Unique identifier of the invoice to update.
  customer_id★(SHORT_TEXT) //Customer/contact ID for this invoice.
  currency_id(SHORT_TEXT)
  contact_persons_associated(LONG_TEXT) //JSON array of contact persons associated with this invoice, 
  invoice_number(SHORT_TEXT)
  place_of_supply(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  is_reverse_charge_applied(CHECKBOX)
  gst_treatment(SHORT_TEXT)
  cfdi_usage(SHORT_TEXT)
  cfdi_reference_type(SHORT_TEXT)
  reference_invoice_id(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  template_id(SHORT_TEXT)
  date(SHORT_TEXT)
  payment_terms(NUMBER)
  payment_terms_label(SHORT_TEXT)
  due_date(SHORT_TEXT)
  discount(NUMBER) //Discount percentage or amount applied at invoice level.
  is_discount_before_tax(CHECKBOX)
  discount_type(STATIC_DROPDOWN) ["Entity Level"|"Item Level"]
  is_inclusive_tax(CHECKBOX)
  exchange_rate(NUMBER)
  recurring_invoice_id(SHORT_TEXT)
  invoiced_estimate_id(SHORT_TEXT)
  salesperson_name(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT)
  location_id(SHORT_TEXT)
  line_items★(LONG_TEXT) //JSON array of line items. To delete a line item, remove it f
  payment_options(LONG_TEXT)
  allow_partial_payments(CHECKBOX)
  custom_body(LONG_TEXT)
  custom_subject(SHORT_TEXT)
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  shipping_charge(SHORT_TEXT)
  adjustment(NUMBER)
  adjustment_description(SHORT_TEXT)
  reason(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  tax_id(SHORT_TEXT)
  expense_id(SHORT_TEXT)
  salesorder_item_id(SHORT_TEXT)
  avatax_tax_code(SHORT_TEXT)
  line_item_id(SHORT_TEXT) //Used when updating a specific line item.
  ignore_auto_number_generation(CHECKBOX) //If true, you must provide invoice_number and it will not be 
`update_item` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  item_id★(SHORT_TEXT) //Unique identifier of the item to update.
  name★(SHORT_TEXT) //Name of the item.
  rate★(NUMBER) //Price of the item.
  description(LONG_TEXT)
  tax_id(SHORT_TEXT) //Not applicable for US/IN editions.
  purchase_tax_rule_id(SHORT_TEXT)
  sales_tax_rule_id(SHORT_TEXT)
  tax_percentage(SHORT_TEXT) //Percent of tax, e.g. "12.5".
  hsn_or_sac(SHORT_TEXT)
  sat_item_key_code(SHORT_TEXT)
  unitkey_code(SHORT_TEXT)
  sku(SHORT_TEXT) //Must be unique across products.
  product_type(SHORT_TEXT) //goods, service, digital_service, etc.
  is_taxable(CHECKBOX)
  tax_exemption_id(SHORT_TEXT)
  purchase_tax_exemption_id(SHORT_TEXT)
  account_id(SHORT_TEXT)
  avatax_tax_code(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  item_type(SHORT_TEXT) //sales, purchases, sales_and_purchases, or inventory.
  purchase_description(LONG_TEXT)
  purchase_rate(SHORT_TEXT)
  purchase_account_id(SHORT_TEXT)
  inventory_account_id(SHORT_TEXT)
  vendor_id(SHORT_TEXT)
  reorder_level(SHORT_TEXT)
  locations(LONG_TEXT) //JSON array of location objects: [{ "location_id": "...", "in
  item_tax_preferences(LONG_TEXT)
  custom_fields(LONG_TEXT)
`update_sales_order` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  salesorder_id★(SHORT_TEXT) //Unique identifier of the sales order to update.
  customer_id★(SHORT_TEXT) //Customer ID receiving the sales order.
  currency_id(SHORT_TEXT)
  contact_persons_associated(LONG_TEXT) //JSON array of contact persons associated with this sales ord
  date(SHORT_TEXT)
  shipment_date(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  place_of_supply(SHORT_TEXT)
  salesperson_id(SHORT_TEXT)
  merchant_id(SHORT_TEXT)
  gst_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  is_inclusive_tax(CHECKBOX)
  location_id(SHORT_TEXT)
  line_items★(LONG_TEXT) //JSON array of line items. To delete a line item, remove it f
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  billing_address_id(SHORT_TEXT)
  shipping_address_id(SHORT_TEXT)
  crm_owner_id(SHORT_TEXT)
  crm_custom_reference_id(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  is_reverse_charge_applied(CHECKBOX)
  salesorder_number(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  is_update_customer(CHECKBOX)
  discount(SHORT_TEXT) //Discount as percentage or amount, e.g. "10" or "10%".
  exchange_rate(NUMBER)
  salesperson_name(SHORT_TEXT)
  notes_default(LONG_TEXT)
  terms_default(LONG_TEXT)
  tax_id(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  tax_authority_name(SHORT_TEXT)
  tax_exemption_code(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  shipping_charge(NUMBER)
  adjustment(NUMBER)
  delivery_method(SHORT_TEXT)
  is_discount_before_tax(CHECKBOX)
  discount_type(STATIC_DROPDOWN) ["Entity Level"|"Item Level"]
  adjustment_description(SHORT_TEXT)
  pricebook_id(SHORT_TEXT)
  template_id(SHORT_TEXT)
  documents(LONG_TEXT) //JSON array of documents (document_id and file_name).
  zcrm_potential_id(SHORT_TEXT)
  zcrm_potential_name(SHORT_TEXT)
  tags(LONG_TEXT)
  ignore_auto_number_generation(CHECKBOX) //If true, you must provide salesorder_number and it will not 
`update_purchase_order` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  purchaseorder_id★(SHORT_TEXT) //Unique identifier of the purchase order to update.
  vendor_id(SHORT_TEXT) //Vendor contact ID for this purchase order.
  currency_id(SHORT_TEXT)
  contact_persons_associated(LONG_TEXT) //JSON array of contact persons associated with this purchase 
  purchaseorder_number(SHORT_TEXT)
  gst_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  source_of_supply(SHORT_TEXT)
  destination_of_supply(SHORT_TEXT)
  place_of_supply(SHORT_TEXT)
  pricebook_id(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  discount(SHORT_TEXT) //Discount amount or percentage.
  discount_account_id(SHORT_TEXT)
  is_discount_before_tax(CHECKBOX)
  billing_address_id(SHORT_TEXT)
  crm_owner_id(SHORT_TEXT)
  crm_custom_reference_id(NUMBER)
  template_id(SHORT_TEXT)
  date(SHORT_TEXT)
  delivery_date(SHORT_TEXT)
  due_date(SHORT_TEXT)
  exchange_rate(NUMBER)
  is_inclusive_tax(CHECKBOX)
  notes(LONG_TEXT)
  notes_default(LONG_TEXT)
  terms(LONG_TEXT)
  terms_default(LONG_TEXT)
  ship_via(SHORT_TEXT)
  delivery_org_address_id(SHORT_TEXT)
  delivery_customer_id(SHORT_TEXT)
  attention(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  is_update_customer(SHORT_TEXT)
  salesorder_id(SHORT_TEXT)
  location_id(SHORT_TEXT)
  line_items★(LONG_TEXT) //JSON array of line items. To delete a line item, remove it f
  custom_fields(LONG_TEXT)
  documents(LONG_TEXT)
  tags(LONG_TEXT)
  ignore_auto_number_generation(CHECKBOX) //If true, you must provide purchaseorder_number and it will n
`update_payment` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  payment_id★(SHORT_TEXT) //Unique identifier of the payment to update.
  customer_id★(SHORT_TEXT) //Customer ID involved in the payment.
  payment_mode★(STATIC_DROPDOWN) ["Cash"|"Check"|"Credit Card"|"Bank Transfer"|"Bank Remittance"|"Auto Transaction"|"Others"]
  amount★(NUMBER) //Total payment amount.
  date(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  description(LONG_TEXT)
  invoices(LONG_TEXT) //JSON array of invoice objects. Each includes invoice_id and 
  invoice_id(SHORT_TEXT) //If invoices JSON is not provided, you can provide a single i
  amount_applied(NUMBER)
  tax_amount_withheld(NUMBER)
  location_id(SHORT_TEXT)
  account_id(SHORT_TEXT) //Cash/bank account the payment is deposited to.
  retainerinvoice_id(SHORT_TEXT)
  exchange_rate(NUMBER)
  payment_form(SHORT_TEXT)
  bank_charges(NUMBER)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT)
`update_expense` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  expense_id★(SHORT_TEXT) //Unique identifier of the expense to update.
  account_id(SHORT_TEXT) //ID of the expense account.
  date(SHORT_TEXT) //Date of the expense.
  amount(NUMBER) //Amount of the expense.
  tax_id(SHORT_TEXT)
  source_of_supply(SHORT_TEXT)
  destination_of_supply(SHORT_TEXT)
  place_of_supply(SHORT_TEXT)
  hsn_or_sac(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  reverse_charge_tax_id(SHORT_TEXT)
  line_items(LONG_TEXT) //JSON array of expense line items.
  location_id(SHORT_TEXT)
  taxes(LONG_TEXT)
  is_inclusive_tax(CHECKBOX)
  is_billable(CHECKBOX)
  reference_number(SHORT_TEXT) //Reference number of the expense.
  description(LONG_TEXT) //Description of the expense.
  customer_id(SHORT_TEXT) //Customer associated when the expense is billable.
  currency_id(SHORT_TEXT)
  exchange_rate(NUMBER)
  project_id(SHORT_TEXT)
  mileage_type(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  product_type(SHORT_TEXT)
  acquisition_vat_id(SHORT_TEXT)
  reverse_charge_vat_id(SHORT_TEXT)
  start_reading(NUMBER)
  end_reading(NUMBER)
  distance(SHORT_TEXT)
  mileage_unit(SHORT_TEXT) //km or mile.
  mileage_rate(NUMBER)
  employee_id(SHORT_TEXT)
  vehicle_type(SHORT_TEXT)
  can_reclaim_vat_on_mileage(SHORT_TEXT)
  fuel_type(SHORT_TEXT)
  engine_capacity_range(SHORT_TEXT)
  paid_through_account_id(SHORT_TEXT)
  vendor_id(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT)
  delete_receipt(CHECKBOX) //If true, removes the attached receipt from the expense.
`update_estimate` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  estimate_id★(SHORT_TEXT) //Unique identifier of the estimate to update.
  customer_id(SHORT_TEXT) //ID of the customer/contact for this estimate. Must be a vali
  currency_id(SHORT_TEXT) //Currency for this estimate from the Currencies API.
  contact_persons_associated(LONG_TEXT) //JSON array of contact person associations with communication
  template_id(SHORT_TEXT) //Estimate template ID used for the PDF layout.
  place_of_supply(SHORT_TEXT)
  gst_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  estimate_number(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  date(SHORT_TEXT)
  expiry_date(SHORT_TEXT)
  exchange_rate(NUMBER)
  discount(NUMBER) //Discount percentage or amount applied at estimate level.
  is_discount_before_tax(CHECKBOX)
  discount_type(STATIC_DROPDOWN) ["Entity Level"|"Item Level"]
  is_inclusive_tax(CHECKBOX)
  custom_body(LONG_TEXT)
  custom_subject(SHORT_TEXT)
  salesperson_name(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  line_items(LONG_TEXT) //JSON array of line items. To delete a line item, remove it f
  location_id(SHORT_TEXT)
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  shipping_charge(SHORT_TEXT)
  adjustment(NUMBER)
  adjustment_description(SHORT_TEXT)
  tax_id(SHORT_TEXT)
  tax_exemption_id(SHORT_TEXT)
  tax_authority_id(SHORT_TEXT)
  avatax_use_code(SHORT_TEXT)
  avatax_exempt_no(SHORT_TEXT)
  vat_treatment(SHORT_TEXT)
  tax_treatment(SHORT_TEXT)
  is_reverse_charge_applied(CHECKBOX)
  project_id(SHORT_TEXT)
  accept_retainer(CHECKBOX)
  retainer_percentage(NUMBER)
  tags(LONG_TEXT)
  ignore_auto_number_generation(CHECKBOX) //If true, you must provide estimate_number and it will not be
`update_bill` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  bill_id★(SHORT_TEXT) //Unique identifier of the bill to update.
  vendor_id(SHORT_TEXT) //Vendor contact ID from Zoho Books.
  currency_id(SHORT_TEXT) //Currency for the bill, from the Currencies API.
  vat_treatment(SHORT_TEXT) //UK only. Example: uk, eu_vat_registered, overseas.
  is_update_customer(CHECKBOX) //If true, updates vendor information when the bill is updated
  purchaseorder_ids(LONG_TEXT) //JSON array of purchase order IDs linked to this bill.
  bill_number(SHORT_TEXT) //Bill number from the vendor. Must remain unique within the o
  documents(LONG_TEXT) //JSON array of document objects as per Zoho Books Bills API.
  source_of_supply(SHORT_TEXT)
  destination_of_supply(SHORT_TEXT)
  place_of_supply(SHORT_TEXT)
  permit_number(SHORT_TEXT)
  gst_treatment(SHORT_TEXT) //business_gst, business_none, overseas, consumer.
  tax_treatment(SHORT_TEXT)
  gst_no(SHORT_TEXT)
  pricebook_id(SHORT_TEXT)
  reference_number(SHORT_TEXT) //Vendor invoice or PO reference.
  date(SHORT_TEXT)
  due_date(SHORT_TEXT)
  payment_terms(NUMBER)
  payment_terms_label(SHORT_TEXT)
  recurring_bill_id(SHORT_TEXT)
  exchange_rate(NUMBER) //Required when bill currency differs from base currency.
  is_item_level_tax_calc(CHECKBOX)
  is_inclusive_tax(CHECKBOX)
  adjustment(NUMBER)
  adjustment_description(SHORT_TEXT)
  location_id(SHORT_TEXT)
  custom_fields(LONG_TEXT)
  tags(LONG_TEXT)
  line_items(LONG_TEXT) //JSON array of line items. To delete a line item, remove it f
  taxes(LONG_TEXT)
  notes(LONG_TEXT)
  terms(LONG_TEXT)
  approvers(LONG_TEXT)
`update_vendor_payment` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  payment_id★(SHORT_TEXT) //Unique identifier of the vendor payment to update.
  vendor_id(SHORT_TEXT) //Vendor associated with this payment.
  bills(LONG_TEXT) //JSON array of bill objects with bill_id, bill_payment_id, am
  date(SHORT_TEXT)
  exchange_rate(NUMBER)
  amount★(NUMBER) //Total amount of the vendor payment.
  paid_through_account_id(SHORT_TEXT) //Cash/bank account from which the payment is made.
  payment_mode(SHORT_TEXT) //Mode of vendor payment (e.g. cash, banktransfer, Stripe, etc
  description(LONG_TEXT)
  reference_number(SHORT_TEXT)
  is_paid_via_print_check(CHECKBOX)
  check_details(LONG_TEXT)
  location_id(SHORT_TEXT)
  tags(LONG_TEXT)
  custom_fields(LONG_TEXT)
`delete_contact` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  contact_id★(SHORT_TEXT) //Unique identifier of the contact to delete.
`delete_invoice` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  invoice_id★(SHORT_TEXT) //Unique identifier of the invoice to delete.
`delete_item` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  item_id★(SHORT_TEXT) //Unique identifier of the item to delete.
`delete_estimate` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  estimate_id★(SHORT_TEXT) //Unique identifier of the estimate to delete.
`delete_employee` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  employee_id★(SHORT_TEXT) //Unique identifier of the employee to delete.
`add_attachment_to_invoice` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect
  invoice_id★(SHORT_TEXT)
  attachment★(FILE) //File to attach to the invoice
  can_send_in_mail(CHECKBOX)=true //Send attachment along with the invoice email
`email_invoice` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect.
  invoice_id★(SHORT_TEXT) //Unique identifier of the invoice to email.
  send_from_org_email_id(CHECKBOX)=false
  from_address_id(SHORT_TEXT)
  to_mail_ids★(LONG_TEXT) //Array of recipient email addresses, e.g. ["a@b.com","c@d.com
  cc_mail_ids(LONG_TEXT) //Array of CC email addresses.
  subject(SHORT_TEXT) //Subject of the email.
  body(LONG_TEXT) //Body of the email (HTML supported).
  send_customer_statement(CHECKBOX)=false
  send_attachment(CHECKBOX)=true
`find_invoice` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  invoice_number(SHORT_TEXT) //Filter by invoice number (exact). Use advanced *_startswith 
  item_name(SHORT_TEXT)
  item_id(SHORT_TEXT)
  item_description(SHORT_TEXT)
  reference_number(SHORT_TEXT)
  customer_name(SHORT_TEXT)
  recurring_invoice_id(SHORT_TEXT)
  email(SHORT_TEXT)
  total(SHORT_TEXT) //Filter by total amount. For range filters, use custom API va
  balance(SHORT_TEXT) //Filter by outstanding balance amount.
  custom_field(SHORT_TEXT)
  date(SHORT_TEXT)
  due_date(SHORT_TEXT)
  created_date(SHORT_TEXT)
  last_modified_time(SHORT_TEXT) //ISO 8601 format, e.g. 2024-01-01T00:00:00-0800
  status(SHORT_TEXT) //sent, draft, overdue, paid, void, unpaid, partially_paid, vi
  customer_id(SHORT_TEXT)
  filter_by(SHORT_TEXT) //Status.* or Date.PaymentExpectedDate
  search_text(SHORT_TEXT) //Search across invoice number, purchase order, and customer n
  sort_column(SHORT_TEXT) //customer_name, invoice_number, date, due_date, total, balanc
  zcrm_potential_id(SHORT_TEXT)
  response_option(NUMBER) //0–4, controls whether summary/aggregates are included with i
  page(NUMBER)
  per_page(NUMBER) //Number of invoices per page (max 200, default 200).
`find_bill` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  bill_number(SHORT_TEXT) //Filter by bill number (exact). Use List API advanced params 
  reference_number(SHORT_TEXT)
  date(SHORT_TEXT)
  status(SHORT_TEXT) //paid, open, overdue, void, partially_paid
  description(SHORT_TEXT)
  vendor_name(SHORT_TEXT)
  total(NUMBER)
  vendor_id(SHORT_TEXT)
  item_id(SHORT_TEXT)
  recurring_bill_id(SHORT_TEXT)
  purchaseorder_id(SHORT_TEXT)
  last_modified_time(SHORT_TEXT) //ISO 8601 format, e.g. 2024-01-01T00:00:00+0530
  filter_by(SHORT_TEXT) //Status.All, Status.Paid, Status.PartiallyPaid, Status.Overdu
  search_text(SHORT_TEXT) //Search across bill number, reference number, and vendor name
  page(NUMBER)
  per_page(NUMBER) //Number of bills per page (default 200).
  sort_column(SHORT_TEXT) //vendor_name, bill_number, date, due_date, total, balance, cr
  sort_order(STATIC_DROPDOWN) ["Ascending (A)"|"Descending (D)"]
`list_currencies` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  filter_by(SHORT_TEXT) //Filter currencies. Example: Currencies.ExcludeBaseCurrency t
  page(NUMBER) //Page number to fetch (default 1).
  per_page(NUMBER) //Number of records per page (default 200, max 200).
`list_active_accounts` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  showbalance(CHECKBOX) //Set to true to include the current balance for each account.
  filter_by(SHORT_TEXT) //Filter by account type or status. E.g., AccountType.All, Acc
  sort_column(SHORT_TEXT) //Sort by account_name or account_type.
  last_modified_time(SHORT_TEXT) //Filter accounts modified after this time (ISO 8601 format).
  page(NUMBER) //Page number to fetch (default 1).
  per_page(NUMBER) //Number of records per page (default 200, max 200).
`list_contacts` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  contact_type(STATIC_DROPDOWN) ["Customer"|"Vendor"]
  contact_name(SHORT_TEXT) //Filter by contact name.
  company_name(SHORT_TEXT)
  first_name(SHORT_TEXT)
  last_name(SHORT_TEXT)
  address(SHORT_TEXT)
  email(SHORT_TEXT) //Primary email of the contact person.
  phone(SHORT_TEXT) //Phone of the primary contact person.
  filter_by(SHORT_TEXT) //Status.All, Status.Active, Status.Inactive, Status.Duplicate
  search_text(SHORT_TEXT) //Search across contact name and notes.
  sort_column(SHORT_TEXT) //contact_name, first_name, last_name, email, outstanding_rece
  zcrm_contact_id(SHORT_TEXT)
  zcrm_account_id(SHORT_TEXT)
  zcrm_vendor_id(SHORT_TEXT)
  page(NUMBER) //Page number to fetch (default 1).
  per_page(NUMBER) //Number of records per page (max 200, default 200).
`list_bill_field_details` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  bill_id★(SHORT_TEXT) //Unique identifier of the bill to retrieve.
`list_contact_persons` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  contact_id★(SHORT_TEXT) //Unique identifier of the contact whose contact persons you w
  page(NUMBER) //Page number to fetch (default 1).
  per_page(NUMBER) //Number of records per page (default 200, max 200).
`list_bill_payments` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  bill_id★(SHORT_TEXT) //Unique identifier of the bill whose payments you want to lis
`list_all_locations` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
`custom_api_request_beta` props:
  organization_id(SHORT_TEXT) //Leave empty to auto-detect from your Zoho Books account.
  method★(STATIC_DROPDOWN)='GET' ["GET"|"POST"|"PUT"|"DELETE"]
  path★(SHORT_TEXT) //Relative path under /books/v3, e.g. contacts, contacts/{cont
  query_params_json(LONG_TEXT) //Optional JSON object of extra query parameters (organization
  body_json(LONG_TEXT) //Optional JSON body for POST/PUT requests.
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### zoho-invoice  v2.0.3 | OAuth2
*Online invoicing software for businesses*
**Triggers:** `customer_payment` `invoice_status_change` `new_contact` `new_contact_person` `new_credit_note` `new_estimate` `new_expense` `new_invoice` `new_item` `new_project` `update_invoice`
**Actions:** `create_invoice` `get_invoice` `update_invoice` `find_invoice` `mark_invoice_as_sent` `mark_invoice_as_draft` `void_invoice` `email_invoice` `create_contact` `get_contact` `update_contact` `find_contact` `find_contact_email` `create_contact_person` `get_contact_person` `update_contact_person` `create_estimate` `get_estimate` `update_estimate` `create_expense` `get_expense` `update_expense` `find_expense` `create_item` `get_item` `update_item` `get_item_by_name` `create_payment` `get_payment` `update_payment` `find_customer_payment` `create_credit_note` `get_credit_note` `update_credit_note` `find_credit_note` `email_credit_note` `create_project` `get_project` `update_project` `create_task` `get_task` `create_user` `update_user` `custom_api_call`

### mollie  v2.0.0 | API Key
*Automate Mollie payments, orders, refunds, customers, and invoices. Triggers on payment events and s*
**Triggers:** `new_customer` `new_order` `new_settlement` `new_invoice` `new_payment` `new_refund` `new_chargeback`
**Actions:** `create_order` `create_payment_link` `create_payment` `create_customer` `create_payment_refund` `search_order` `search_payment` `search_customer`

### razorpay  v2.0.0 | Custom(keyID,keySecret)
*Automate your payments and financial operations with Razorpay. Create payment links and use custom A*
**Actions:** `custom_api_call` `create-payment-link`

### chargekeep  v2.0.0 | Custom(base_url,api_key)
*Easy-to-use recurring and one-time payments software for Stripe & PayPal*
**Triggers:** `new_lead` `new_payment` `new_subscription`
**Actions:** `addOrUpdateContact` `addOrUpdateContact(extended)` `addOrUpdateSubscription` `createInvoice` `createProduct` `getContactDetails`

### checkout  v2.0.0 | API Key
*Manage payments, customers, and payouts with Checkout.com. Automate payment links, refunds, and moni*
**Triggers:** `payment_events` `dispute_events`
**Actions:** `create_customer` `update_customer` `create_payment_link` `create_payment` `refund_payment` `get_payment_details` `get_payment_actions`

### amazon-seller  v2.0.1 | Custom(lwaClientId,lwaClientSecret,refreshToken,marketplaceId,sellerId,awsRegion,awsAccessKeyId,awsSecretAccessKey)
*Amazon Selling Partner API for managing orders, inventory, and seller operations.*
**Triggers:** `new_order_placed`
**Actions:** `list_orders` `get_order` `get_order_items` `get_order_address` `get_order_buyer_info` `get_order_items_buyer_info` `get_order_regulated_info` `search_orders` `custom_api_call`

### cartloom  v2.0.0 | Custom(domain,apiKey)
*Sell products beautifully*
**Actions:** `get_products` `get_order` `create_discount` `get_discount` `get_all_discounts` `get_orders_by_date` `get_orders_by_email` `custom_api_call`

### pandadoc  v2.0.0 | API Key
*Create, track, and eSign documents with PandaDoc. Automate document creation from templates, manage *
**Triggers:** `documentCompleted` `documentStateChanged` `documentUpdated`
**Actions:** `createDocumentFromTemplate` `createAttachment` `createOrUpdateContact` `findDocument` `getDocumentAttachments` `getDocumentDetails` `downloadDocument` `custom_api_call`

### docusign  v2.0.0 | Custom(clientId,privateKey,environment,impersonatedUserId,scopes)
*Manage eSignatures and document workflows with DocuSign. List envelopes, retrieve envelope details, *
**Actions:** `listEnvelopes` `getEnvelope` `getDocument` `custom_api_call`

### saleor  v2.0.0 | Custom(apiUrl,token)
*Manage your e-commerce operations with Saleor. Execute custom GraphQL queries, retrieve order detail*
**Actions:** `rawGraphqlQuery` `getOrder` `addOrderNote`

### vtex  v2.0.0 | Custom(hostUrl,appKey,appToken)
*Unified commerce platform*
**Actions:** `get-product-by-id` `create-product` `Update-product` `get-brand-list` `get-brand-by-id` `create-brand` `update-brand` `delete-brand` `get-category-by-id` `get-sku-by-product-id` `create-sku` `create-sku-file` `get-client-list` `get-client-by-id` `get-order-by-id` `get-order-list` `custom_api_call`

### webflow  v2.0.0 | OAuth2
*Design, build, and launch responsive websites visually*
**Triggers:** `new_submission`
**Actions:** `create_collection_item` `delete_collection_item` `update_collection_item` `find_collection_item` `get_collection_item` `fulfill_order` `unfulfill_order` `refund_order` `find_order` `custom_api_call`

### wordpress  v2.0.0 | Custom(username,password,website_url)
*Open-source website creation software*
**Triggers:** `new_post`
**Actions:** `create_post` `create_page` `update_post` `get_post` `custom_api_call`

### bubble  v2.0.0 | None
*No-code platform for web and mobile apps*
**Actions:** `bubble_create_thing` `bubble_delete_thing` `bubble_update_thing` `bubble_get_thing` `bubble_list_things`

### onfleet  v2.0.0 | API Key
*Last mile delivery software*
**Triggers:** `task_arrival` `task_assigned` `task_cloned` `task_completed` `task_created` `task_delayed` `task_deleted` `task_eta` `task_failed` `task_started` `task_unassigned` `task_updated` `worker_created` `worker_deleted` `worker_duty_change` `auto_dispatch_completed` `sms_recipient_opt_out` `sms_recipient_response_missed`
**Actions:** `create_recipient` `update_recipient` `get_recipient` `create_task` `delete_task` `complete_task` `clone_task` `update_task` `get_task` `get_tasks` `create_destination` `get_destination` `get_hubs` `create_hub` `update_hub` `get_organization` `get_delegatee_details` `create_admin` `update_admin` `get_admins` `delete_admin` `create_worker` `delete_worker` `get_worker` `get_worker_schedule` `update_worker` `create_team` `delete_team` `get_team` `get_teams` `update_team` `get_container` `custom_api_call`

### simpliroute  v2.0.0 | API Key
*Connect with SimpliRoute, the last-mile delivery optimization platform. Manage clients, vehicles, vi*
**Actions:** `get_me` `get_clients` `create_clients` `bulk_delete_clients` `create_client_property` `get_vehicles` `create_vehicle` `get_vehicle` `delete_vehicle` `get_visits` `create_visits` `get_visit` `update_visit_partial` `update_visit` `delete_visit` `add_visit_items` `get_routes` `create_route` `get_route` `delete_route` `get_plans` `create_plan` `get_plan_vehicles` `get_visit_detail` `get_drivers` `create_users` `get_user` `update_user` `get_skills` `get_observations` `get_tags` `get_zones` `get_fleets` `get_sellers` `custom_api_call`

### netsuite  v2.0.0 | Custom(accountId,consumerKey,consumerSecret,tokenId,tokenSecret)
*Manage your business operations with NetSuite. Automate customer and vendor data retrieval, and inte*
**Actions:** `getVendor` `getCustomer` `custom_api_call`

### zuora  v2.0.0 | Custom(clientId,clientSecret,environment)
*Cloud-based subscription management platform that enables businesses to launch and monetize subscrip*
**Actions:** `create-invoice` `find-account` `find-product-rate-plan` `find-product`

### truelayer  v2.0.0 | OAuth2
*Connect with TrueLayer to leverage secure open banking services. This integration allows seamless in*
**Actions:** `create-payout` `get-payout` `start-payout-authorization-flow` `submit-payments-provider-return-parameters` `create-mandate` `list-mandate` `get-mandate` `start-mandate-authorization-flow` `submit-consent-mandate` `submit-mandate-provider-selection` `revoke-mandate` `confirm-mandate-funds` `get-constraints` `list-operating-accounts` `get-operating-account` `merchant-account-get-transactions` `merchant-account-setup-sweeping` `merchant-account-disable-sweeping` `merchant-account-get-sweeping` `get-merchant-account-payment-sources` `create-payment-link` `get-payment-link` `get-payment-link-payments` `create-payment` `start-payment-authorization-flow` `submit-provider-selection` `submit-scheme-selection` `submit-form` `submit-consent` `submit-user-account-selection` `cancel-payment` `save-user-account-payment` `get-payment` `create-payment-refund` `get-payment-refunds` `get-payment-refund` `search-payment-providers` `get-payment-provider` `custom_api_call`

### wedof  v2.0.0 | API Key
*Automatisez la gestion de vos dossiers de formations (CPF, EDOF, Kairos, AIF, OPCO et autres)*
**Triggers:** `newRegistrationFolderNotProcessed` `registrationFolderUpdated` `registrationFolderAccepted` `registrationFolderInTraining` `registrationFolderTerminated` `registrationFolderPaid` `registrationFolderSelected` `registrationFolderTobill` `newCertificationFolderCreated` `certificationFolderUpdated` `certificationFolderRegistred` `certificationFolderTotake` `certificationFolderToControl` `certificationfolderSuccess` `certificationFolderToretake` `certificationFolderSelected` `certificationFolderSurveyInitialExperienceAvailable` `certificationFolderSurveyInitialExperienceAnswered` `certificationFolderSurveyLongTermExperienceAnswered` `certificationFolderSurveyLongTermExperienceAvailable` `certificationFolderSurveySixMonthExperienceAnswered` `certificationFolderSurveySixMonthExperienceAvailable` `certificationPartnerAborted` `certificationPartnerProcessing` `certificationPartnerActive` `certificationPartnerRefused` `certificationPartnerRevoked` `certificationPartnerSuspended`
**Actions:** `listPartnerStats` `getRegistrationFolder` `listRegistrationFolders` `updateRegistrationFolder` `validateRegistrationFolder` `declareRegistrationFolderTerminated` `declareRegistrationFolderServicedone` `declareRegistrationFolderIntraining` `billRegistrationFolder` `cancelRegistrationFolder` `refuseRegistrationFolder` `getMinimalSessionsDates` `getRegistrationFolderDocuments` `updateCompletionRate` `createRegistrationFolder` `getCertificationFolder` `searchCertificationFolder` `declareCertificationFolderRegistred` `declareCertificationFolderToTake` `declareCertificationFolderToControl` `declareCertificationFolderSuccess` `declareCertificationFolderToRetake` `declareCertificationFolderFailed` `refuseCertificationFolder` `abortCertificationFolder` `getCertificationFolderDocuments` `updateCertificationFolder` `createCertificationFolder` `listActivitiesAndTasks` `createTask` `createActivitie` `sendFile` `me` `myOrganism` `addExecutionTag` `getCertificationFolderSurvey` `listCertificationFolderSurveys` `createCertificationPartnerAudit` `createGeneralAudit` `getPartnership` `updatePartnership` `deletePartnership` `listPartnerships` `createPartnership` `resetPartnership`

### respaid  v2.0.0 | API Key
*Automate your debt collection and payment recovery with Respaid. Recover unpaid invoices and manage *
**Triggers:** `new_campaign_creation` `new_cancelled_case` `new_disputed_case` `new_payout` `new_successful_collection_paid_to_creditor` `new_successful_installment_payment_via_respaid` `new_successful_collection_via_legal_officer` `new_successful_partial_payment_to_creditor` `new_successful_partial_payment_via_respaid` `new_successful_collection_via_respaid`
**Actions:** `create_new_campaign` `stop_collection_client_paid_directly` `stop_collection_for_direct_partial_payment` `stop_collection_for_direct_instalment_payment`

## ★ MARKETING & EMAIL

### mailchimp  v2.0.2 | OAuth2
*All-in-One integrated marketing platform for managing audiences, sending campaigns, tracking engagem*
**Triggers:** `subscribe` `unsubscribe` `subscriber_updated` `new_campaign` `email_opened` `link_clicked` `cleaned_emails` `email_address_changes` `new_audience` `new_customer` `new_order` `new_segment_tag_subscriber`
**Actions:** `add_member_to_list` `add_new_member_with_custom_fields` `add_note_to_subscriber` `add_subscriber_to_tag` `add_member_to_segment` `remove_subscriber_from_tag` `remove_member_from_segment` `remove_member_tags_list` `update_member_in_list` `update_member_with_custom_fields` `create_campaign` `send_campaign` `get_campaign_report` `click_report` `search_campaigns` `create_audience` `create_tag` `create_custom_event` `archive_subscriber` `permanently_delete_member` `delete_list_member` `unsubscribe_email` `get_all_members` `get_list_segments` `get_list_tags` `get_interests_information` `find_campaign` `find_customer` `find_tag` `find_subscriber`

### convertkit  v2.0.0 | API Key
*Email marketing for creators*
**Triggers:** `webhook_subscriber_tag_add` `webhook_subscriber_tag_remove` `webhook_subscriber_activated` `webhook_subscriber_unsubscribed` `webhook_subscriber_bounced` `webhook_subscriber_complained` `webhook_form_subscribed` `webhook_sequence_subscribed` `webhook_sequence_completed` `webhook_link_clicked` `webhook_product_purchased` `webhook_purchase_created`
**Actions:** `subscribers_get_subscriber_by_id` `subscribers_get_subscriber_by_email` `subscribers_list_subscribers` `subscribers_update_subscriber` `subscribers_unsubscribe_subscriber` `subscribers_list_tags_by_email` `subscribers_list_tags_by_subscriber_id` `create_webhook` `destroy_webhook` `custom_fields_list_fields` `custom_fields_create_field` `custom_fields_update_field` `custom_fields_delete_field` `broadcasts_list_broadcasts` `broadcasts_create_broadcast` `broadcasts_get_broadcast` `broadcasts_update_broadcast` `broadcasts_delete_broadcast` `broadcasts_broadcast_stats` `forms_list_forms` `forms_add_subscriber_to_form` `forms_list_form_subscriptions` `sequences_list_sequences` `sequences_add_subscriber_to_sequence` `sequences_list_subscriptions_to_sequence` `tags_list_tags` `tags_create_tag` `tags_tag_subscriber` `tags_remove_tag_from_subscriber_by_email` `tags_remove_tag_from_subscriber_by_id` `tags_list_subscriptions_to_tag` `purchases_list_purchases` `purchases_get_purchase_by_id` `purchases_create_purchase` `purchases_create_multiple_purchases`
`webhook_subscriber_tag_add` props:
  tagId★(DROPDOWN) //Choose a Tag
`webhook_subscriber_tag_remove` props:
  tagId★(DROPDOWN) //Choose a Tag
`webhook_form_subscribed` props:
  formId★(DROPDOWN)
`webhook_sequence_subscribed` props:
  sequenceIdChoice★(DROPDOWN)
`webhook_sequence_completed` props:
  sequenceIdChoice★(DROPDOWN)
`webhook_link_clicked` props:
  initiatorValue★(SHORT_TEXT) //The initiator value URL that will trigger the webhook
`webhook_product_purchased` props:
  productId★(NUMBER) //The product ID
`subscribers_get_subscriber_by_id` props:
  subscriberId★(SHORT_TEXT) //The subscriber ID
`subscribers_get_subscriber_by_email` props:
  email_address★(SHORT_TEXT) //The email of the subscriber
`subscribers_list_subscribers` props:
  page(NUMBER)=1 //Page number. Each page of results will contain up to 50 subs
  sortOrder★(STATIC_DROPDOWN)='asc' ["Ascending"|"Descending"] //Sort order
  sortField(SHORT_TEXT) //Sort field
  from(DATE_TIME) //Return subscribers created after this date
  to(DATE_TIME) //Return subscribers created before this date
  updatedFrom(DATE_TIME) //Return subscribers updated after this date
  updatedTo(DATE_TIME) //Return subscribers updated before this date
  emailAddress★(SHORT_TEXT) //The email of the subscriber
`subscribers_update_subscriber` props:
  subscriberId★(SHORT_TEXT) //The subscriber ID
  emailAddress(SHORT_TEXT) //The email of the subscriber
  firstName(SHORT_TEXT) //The first name of the subscriber
  fields(DYNAMIC) //The custom fields
`subscribers_unsubscribe_subscriber` props:
  email★(SHORT_TEXT) //The email of the subscriber
`subscribers_list_tags_by_email` props:
  email_address★(SHORT_TEXT) //The email of the subscriber
`subscribers_list_tags_by_subscriber_id` props:
  subscriberId★(SHORT_TEXT) //The subscriber ID
`create_webhook` props:
  targetUrl★(SHORT_TEXT) //The URL that will be called when the webhook is triggered
  event★(STATIC_DROPDOWN) //The event that will trigger the webhook
  eventParameter(DYNAMIC) //The required parameter for the event
`destroy_webhook` props:
  webhookId★(NUMBER) //The webhook rule id
`custom_fields_create_field` props:
  fields★(ARRAY) //The custom fields
`custom_fields_update_field` props:
  label★(DROPDOWN)
  new_label★(SHORT_TEXT) //The new label for the custom field
`custom_fields_delete_field` props:
  label★(DROPDOWN)
`broadcasts_list_broadcasts` props:
  page(NUMBER)=1 //Page number. Each page of results will contain up to 50 broa
`broadcasts_create_broadcast` props:
  content(SHORT_TEXT) //The broadcast's email content - this can contain text and si
  description(SHORT_TEXT) //An internal description of this broadcast
  emailAddress(SHORT_TEXT) //Sending email address; leave blank to use your account's def
  emailLayoutTemplate(SHORT_TEXT) //Name of the email template to use; leave blank to use your a
  isPublic(CHECKBOX)=false //Specifies whether or not this is a public post
  publishedAt(DATE_TIME) //Specifies the time that this post was published (applicable 
  sendAt(DATE_TIME) //Time that this broadcast should be sent; leave blank to crea
  subject(SHORT_TEXT) //The broadcast email's subject
  thumbnailAlt(SHORT_TEXT) //Specify the ALT attribute of the public thumbnail image (app
  thumbnailUrl(SHORT_TEXT) //Specify the URL of the thumbnail image to accompany the broa
`broadcasts_get_broadcast` props:
  broadcastId★(SHORT_TEXT) //The broadcast id
`broadcasts_update_broadcast` props:
  broadcastId★(SHORT_TEXT) //The broadcast id
  content(SHORT_TEXT) //The broadcast's email content - this can contain text and si
  description(SHORT_TEXT) //An internal description of this broadcast
  emailAddress(SHORT_TEXT) //Sending email address; leave blank to use your account's def
  emailLayoutTemplate(SHORT_TEXT) //Name of the email template to use; leave blank to use your a
  isPublic(CHECKBOX)=false //Specifies whether or not this is a public post
  publishedAt(DATE_TIME) //Specifies the time that this post was published (applicable 
  sendAt(DATE_TIME) //Time that this broadcast should be sent; leave blank to crea
  subject(SHORT_TEXT) //The broadcast email's subject
  thumbnailAlt(SHORT_TEXT) //Specify the ALT attribute of the public thumbnail image (app
  thumbnailUrl(SHORT_TEXT) //Specify the URL of the thumbnail image to accompany the broa
`broadcasts_delete_broadcast` props:
  broadcastId★(SHORT_TEXT) //The broadcast id
`broadcasts_broadcast_stats` props:
  broadcastId★(SHORT_TEXT) //The broadcast id
`forms_add_subscriber_to_form` props:
  formId★(DROPDOWN)
  email★(SHORT_TEXT) //The email of the subscriber
  firstName(SHORT_TEXT) //The first name of the subscriber
  tags(MULTI_SELECT_DROPDOWN) //Choose the Tags
  fields(DYNAMIC) //The custom fields
`forms_list_form_subscriptions` props:
  formId★(DROPDOWN)
`sequences_add_subscriber_to_sequence` props:
  sequenceId★(DROPDOWN)
  email★(SHORT_TEXT) //The email of the subscriber
  firstName(SHORT_TEXT) //The first name of the subscriber
  tags(MULTI_SELECT_DROPDOWN) //Choose the Tags
  fields(DYNAMIC) //The custom fields
`sequences_list_subscriptions_to_sequence` props:
  sequenceId★(DROPDOWN)
`tags_create_tag` props:
  name★(SHORT_TEXT) //The name of the tag
`tags_tag_subscriber` props:
  email★(SHORT_TEXT) //The email of the subscriber
  firstName(SHORT_TEXT) //The first name of the subscriber
  tags★(MULTI_SELECT_DROPDOWN) //Choose the Tags
  fields(DYNAMIC) //The custom fields
`tags_remove_tag_from_subscriber_by_email` props:
  email★(SHORT_TEXT) //The email of the subscriber
  tagId★(DROPDOWN) //The tag to remove
`tags_remove_tag_from_subscriber_by_id` props:
  subscriberId★(SHORT_TEXT) //The subscriber ID
  tagId★(DROPDOWN) //The tag to remove
`tags_list_subscriptions_to_tag` props:
  tagId★(DROPDOWN) //Choose a Tag
  page(NUMBER)=1 //Each page of results will contain up to 50 tags.
  sortOrder(STATIC_DROPDOWN) ["Ascending"|"Descending"] //Sort order
  subscriberState(STATIC_DROPDOWN) ["Active"|"canceled"] //Subscriber state
`purchases_list_purchases` props:
  page★(NUMBER)=1 //Page number. Each page of results will contain up to 50 purc
`purchases_get_purchase_by_id` props:
  purchaseId★(SHORT_TEXT) //The purchase ID
`purchases_create_purchase` props:
  transactionId★(NUMBER) //The transaction ID
  transactionTime(DATE_TIME) //The transaction time
  emailAddress★(SHORT_TEXT) //The email address of the subscriber
  firstName(SHORT_TEXT) //The first name of the subscriber
  status(STATIC_DROPDOWN) ["paid"|"pending"|"failed"] //The status of the purchase
  currency★(STATIC_DROPDOWN) //The currency of the purchase
  subtotal(NUMBER) //The subtotal
  shipping(NUMBER) //The shipping
  discount(NUMBER) //The discount
  tax(NUMBER) //The tax
  total(NUMBER) //The total
  pid★(NUMBER) //The product ID
  lid★(NUMBER) //The line item ID
  name★(SHORT_TEXT) //The name of the product
  sku(SHORT_TEXT) //The SKU of the product
  unit_price★(NUMBER) //The unit price of the product
  quantity★(NUMBER) //The quantity of the product
`purchases_create_multiple_purchases` props:
  transactionId★(NUMBER) //The transaction ID
  transactionTime(DATE_TIME) //The transaction time
  emailAddress★(SHORT_TEXT) //The email address of the subscriber
  firstName(SHORT_TEXT) //The first name of the subscriber
  status(STATIC_DROPDOWN) ["paid"|"pending"|"failed"] //The status of the purchase
  currency★(STATIC_DROPDOWN) //The currency of the purchase
  subtotal(NUMBER) //The subtotal
  shipping(NUMBER) //The shipping
  discount(NUMBER) //The discount
  tax(NUMBER) //The tax
  total(NUMBER) //The total
  multipleProducts★(JSON) //The products

### mailer-lite  v2.0.0 | API Key
*Email marketing software*
**Triggers:** `subscriber.created` `subscriber.updated` `subscriber.unsubscribed` `subscriber.added_to_group`
**Actions:** `add_subscriber_to_group` `add_or_update_subscriber` `find_subscriber` `remove_subscriber_from_group` `custom_api_call`
`subscriber.created` props:
  name★(SHORT_TEXT)
`subscriber.updated` props:
  name★(SHORT_TEXT)
`subscriber.unsubscribed` props:
  name★(SHORT_TEXT)
`subscriber.added_to_group` props:
  name★(SHORT_TEXT)
`add_subscriber_to_group` props:
  subscriberId★(DROPDOWN)
  subscriberGroupId★(DROPDOWN)
`add_or_update_subscriber` props:
  email★(SHORT_TEXT) //Email of the new contact
  subscriberFields★(DYNAMIC)
  status(STATIC_DROPDOWN)='active' ["Active"|"Unsubscribed"|"Unconfirmed"|"Bounced"|"Junk"] //If empty, status Active is used by default.
  subscriberGroupId(MULTI_SELECT_DROPDOWN)
  subscribed_at(DATE_TIME)
  opted_in_at(DATE_TIME)
  ip_address(SHORT_TEXT)
  optin_ip(SHORT_TEXT)
`find_subscriber` props:
  searchValue★(SHORT_TEXT)
`remove_subscriber_from_group` props:
  subscriberId★(DROPDOWN)
  subscriberGroupId★(DROPDOWN)
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### emailoctopus  v2.0.0 | API Key
*Email marketing platform for list management, campaign sending, tagging & unsubscribes. Automate con*
**Triggers:** `email_bounced` `email_opened` `emailClicked` `newContact` `contactUnsubscribes`
**Actions:** `add_or_update_contact` `unsubscribe_contact` `update_contact_email` `add_tag_to_contact` `remove_tag_from_contact` `create_list` `find_contact` `custom_api_call`
`email_bounced` props:
  campaign_id(DROPDOWN) //Select a campaign to filter events. Leave blank to trigger f
  liveMarkdown(MARKDOWN) //**Live URL:** ```text {{webhookUrl}} ```
  instructions(MARKDOWN) //**Manual Setup Required** 1. Go to your EmailOctopus Dashboa
`email_opened` props:
  campaign_id(DROPDOWN) //Select a campaign to filter events. Leave blank to trigger f
  liveMarkdown(MARKDOWN) //**Live URL:** ```text {{webhookUrl}} ```
  instructions(MARKDOWN) //**Manual Setup Required** 1. Go to your EmailOctopus Dashboa
`emailClicked` props:
  campaign_id(DROPDOWN) //Select a campaign to filter events. Leave blank to trigger f
  liveMarkdown(MARKDOWN) //**Live URL:** ```text {{webhookUrl}} ```
  instructions(MARKDOWN) //**Manual Setup Required** 1. Go to your EmailOctopus Dashboa
`newContact` props:
  list_id★(DROPDOWN) //The mailing list to use.
  liveMarkdown(MARKDOWN) //**Live URL:** ```text {{webhookUrl}} ```
  instructions(MARKDOWN) //**Manual Setup Required** 1. Go to your EmailOctopus Dashboa
`contactUnsubscribes` props:
  list_id★(DROPDOWN) //The mailing list to use.
  liveMarkdown(MARKDOWN) //**Live URL:** ```text {{webhookUrl}} ```
  instructions(MARKDOWN) //**Manual Setup Required** 1. Go to your EmailOctopus Dashboa
`add_or_update_contact` props:
  list_id★(DROPDOWN) //The mailing list to use.
  email_address★(SHORT_TEXT) //The contact's email address.
  fields★(DYNAMIC) //The contact's custom fields.
  tags(ARRAY) //Tags to associate with the contact. Existing tags will not b
  status(STATIC_DROPDOWN) ["Subscribed"|"Unsubscribed"|"Pending"] //The status of the contact.
`unsubscribe_contact` props:
  list_id★(DROPDOWN) //The mailing list to use.
  email_address★(SHORT_TEXT) //The email address of the contact to unsubscribe.
`update_contact_email` props:
  list_id★(DROPDOWN) //The mailing list to use.
  current_email_address★(SHORT_TEXT) //The contact's current email address used to find them.
  new_email_address★(SHORT_TEXT) //The new email address for the contact.
`add_tag_to_contact` props:
  list_id★(DROPDOWN) //The mailing list to use.
  email_address★(SHORT_TEXT) //The contact's email address.
  tags★(ARRAY) //The tags to add to the contact.
`remove_tag_from_contact` props:
  list_id★(DROPDOWN) //The mailing list to use.
  email_address★(SHORT_TEXT) //The email address of the contact to modify.
  tags★(ARRAY) //The tags to remove from the contact.
`create_list` props:
  name★(SHORT_TEXT) //The name for the new list.
`find_contact` props:
  list_id★(DROPDOWN) //The mailing list to use.
  email_address★(SHORT_TEXT) //The email address of the contact to find.
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### campaign-monitor  v2.0.0 | API Key
*Email marketing platform for delivering exceptional email campaigns.*
**Triggers:** `new_subscriber_added` `subscriber_unsubscribed` `new_client`
**Actions:** `add_subscriber_to_list` `update_subscriber_details` `unsubscribe_subscriber` `find_subscriber`
`new_subscriber_added` props:
  clientId★(DROPDOWN)
  listId★(DROPDOWN)
`subscriber_unsubscribed` props:
  clientId★(DROPDOWN)
  listId★(DROPDOWN)
`add_subscriber_to_list` props:
  clientId★(DROPDOWN)
  listId★(DROPDOWN)
  email★(SHORT_TEXT)
  name(SHORT_TEXT)
  phone(SHORT_TEXT)
  consentToTrack★(STATIC_DROPDOWN)='Unchanged' ["Yes"|"No"|"Unchanged"] //Whether the subscriber has consented to tracking.
  consentToSendSms(STATIC_DROPDOWN)='Unchanged' ["Yes"|"No"|"Unchanged"] //Whether the subscriber has consented to send SMS.
  resubscribe(CHECKBOX)=false //If true, the subscriber will be resubscribed if they previou
  fields★(DYNAMIC)
`update_subscriber_details` props:
  clientId★(DROPDOWN)
  listId★(DROPDOWN)
  email★(SHORT_TEXT)
  name(SHORT_TEXT)
  phone(SHORT_TEXT)
  consentToTrack(STATIC_DROPDOWN)='Yes' ["Yes"|"No"|"Unchanged"] //Whether the subscriber has consented to tracking.
  consentToSendSms(STATIC_DROPDOWN)='Unchanged' ["Yes"|"No"|"Unchanged"] //Whether the subscriber has consented to send SMS.
  resubscribe(CHECKBOX)=false //If true, the subscriber will be resubscribed if they previou
  fields★(DYNAMIC)
`unsubscribe_subscriber` props:
  clientId★(DROPDOWN)
  listId★(DROPDOWN)
  email★(SHORT_TEXT) //The email address of the subscriber to unsubscribe.
`find_subscriber` props:
  clientId★(DROPDOWN)
  listId★(DROPDOWN)
  email★(SHORT_TEXT) //The email address of the subscriber to find

### sendinblue  v2.0.0 | API Key
*Formerly Sendinblue, is a SaaS solution for relationship marketing*
**Actions:** `create_or_update_contact` `custom_api_call`

### drip  v2.0.0 | API Key
*E-commerce CRM for B2B marketers*
**Triggers:** `new_subscriber` `tag_applied_to_subscribers`
**Actions:** `apply_tag_to_subscriber` `add_subscriber_to_campaign` `upsert_subscriber` `custom_api_call`

### beehiiv  v2.0.0 | API Key
*Manage subscriptions, create posts, and automate your newsletter workflow with beehiiv.*
**Triggers:** `beehiiv_new_post_sent` `beehiiv_user_unsubscribes` `beehiiv_new_subscription_confirmed`
**Actions:** `create_subscription` `update_subscription` `add_subscription_to_automation` `list_automations` `list_posts` `custom_api_call`

### ghostcms  v2.0.0 | Custom(baseUrl,apiKey)
*Publishing platform for professional bloggers*
**Triggers:** `member_added` `member_edited` `member_deleted` `post_published` `post_scheduled` `page_published`
**Actions:** `create_member` `update_member` `create_post` `find_member` `find_user` `custom_api_call`

### constant-contact  v2.0.0 | OAuth2
*Email marketing for small businesses*
**Actions:** `create_or_update_contact` `custom_api_call`

### customer-io  v2.0.0 | Custom(region,track_site_id,track_api_key,api_bearer_token)
*Create personalized journeys across all channels with our customer engagement platform.*
**Actions:** `create_event` `custom_track_api_call` `custom_app_api_call`

### mautic  v2.0.0 | Custom(base_url,username,password)
*Open-source marketing automation software*
**Triggers:** `mautic_lead_post_save_update_trigger` `mautic_lead_company_change_trigger` `mautic_lead_channel_subscription_changed_trigger` `mautic_lead_post_save_new_trigger`
**Actions:** `create_mautic_contact` `search_mautic_contact` `update_mautic_contact` `create_mautic_company` `search_mautic_company` `update_mautic_company` `custom_api_call`

### sendpulse  v2.0.0 | Custom(clientId,clientSecret)
*Automate your multi-channel marketing with SendPulse. Manage subscribers, update contact details, an*
**Triggers:** `new_subscriber` `new_unsubscriber` `updated_subscriber`
**Actions:** `add-subscriber` `change-variable-for-subscriber` `delete-contact` `unsubscribe-user` `update-subscriber` `custom_api_call`

### mailjet  v2.0.0 | Basic Auth
*Email delivery service for sending transactional and marketing emails*
**Actions:** `send_email`

### maileroo  v2.0.0 | Custom(keyType,apiKey)
*Email Delivery Service with Real-Time Analytics and Reporting*
**Actions:** `sendEmail` `sendFromTemplate` `verifyEmail`

### resend  v2.0.0 | API Key
*Email for developers*
**Actions:** `send_email` `custom_api_call`

### sendfox  v2.0.0 | API Key
*Email marketing made simple*
**Actions:** `create-list` `unsubscribe` `create-contact` `custom_api_call`

### smaily  v2.0.0 | Custom(domain,username,password)
*Automate your email marketing with Smaily. Effortlessly manage your subscribers, update contact info*
**Actions:** `create-or-update-subscriber` `get-subscriber` `custom_api_call`

### zagomail  v2.0.0 | API Key
*All-in-one email marketing and automation platform*
**Triggers:** `addedSubscriber` `unsubscribedSubscriber` `taggedSubscriber`
**Actions:** `createSubscriber` `tagSubscriber` `updateSubscriber` `searchSubscriberByEmail` `getSubscriberDetails` `getCampaignDetails`

### tarvent  v2.0.0 | Custom(accountId,apiKey)
*Tarvent is an email marketing, automation, and email API platform that allows to you to send campaig*
**Triggers:** `tarvent_contact_added` `tarvent_contact_group_updated` `tarvent_contact_updated` `tarvent_contact_status_updated` `tarvent_contact_tag_updated` `tarvent_contact_note_added` `tarvent_contact_unsubscribed` `tarvent_form_submitted` `tarvent_page_performed` `tarvent_survey_submitted` `tarvent_contact_clicked` `tarvent_contact_opened` `tarvent_contact_replied` `tarvent_contact_bounced` `tarvent_campaign_send_finished` `tarvent_transaction_created` `tarvent_transaction_sent`
**Actions:** `tarvent_create_contact` `tarvent_update_contact_tag` `tarvent_update_contact_group` `tarvent_create_contact_note` `tarvent_update_contact_journey` `tarvent_update_contact_status` `tarvent_create_audience_group` `tarvent_update_journey_status` `tarvent_create_transaction` `tarvent_send_campaign` `tarvent_generate_custom_event` `tarvent_get_audiences` `tarvent_get_audience_groups` `tarvent_create_suppression_filter` `tarvent_get_campaigns` `tarvent_get_contact` `tarvent_get_custom_event` `tarvent_get_journey`

### sendy  v2.0.0 | Custom(domain,apiKey,brandId)
*Self-hosted email marketing software*
**Actions:** `count_subscribers` `create_campaign` `delete_subscriber` `get_brands` `get_brand_lists` `get_subscription_status` `subscribe` `subscribe_multiple_lists` `unsubscribe` `unsubscribe_multiple`

### vbout  v2.0.0 | API Key
*Marketing automation platform for agencies*
**Actions:** `vbout_add_contact` `vbout_add_tag` `vbout_create_email_list` `vbout_add_email_marketing_campaign` `vbout_create_social_media_message` `vbout_get_contact_by_email` `vbout_get_email_list` `vbout_remove_tag` `vbout_unsubscribe_contact` `vbout_update_contact`

### smoove  v2.0.0 | API Key
*Smoove is a platform for creating and managing your email list and sending emails to your subscriber*
**Triggers:** `newListCreated` `newSubscriber` `newFormCreated` `newLeadSubmitted`
**Actions:** `addOrUpdateSubscriber` `createAList` `findSubscriber` `unsubscribe`

### acumbamail  v2.0.1 | API Key
*Easily send email and SMS campaigns and boost your business*
**Actions:** `acumbamail_add_update_subscriber` `acumbamail_create_subscriber_list` `acumbamail_unsubscribe_subscriber` `acumbamail_delete_subscriber_list` `acumbamail_search_subscriber` `acumbamail_remove_subscriber`

### clickfunnels  v2.0.0 | Custom(subdomain,apiKey)
*Manage sales funnels, track leads, and automate marketing workflows with ClickFunnels.*
**Triggers:** `scheduledAppointmentEventCreated` `courseEnrollmentCreatedForContact` `contactSubmittedForm` `OneTimeOrderPaid` `subscriptionInvoicePaid` `contactCompletedCourse` `contactIdentified` `contactSuspendedFromCourse`
**Actions:** `createOpportunity` `applyTagToContact` `removeTagFromContact` `enrollAContactIntoACourse` `updateOrCreateContact` `searchContacts` `custom_api_call`

### foreplay-co  v2.0.0 | API Key
*Competitive advertising data and creative insights platform. Search, filter, and analyze ads and bra*
**Triggers:** `newAdInSpyder` `newAdInBoard` `newSwipefileAd`
**Actions:** `getAdById` `getAdsByPage` `findBrands` `findAds` `findBoards`

### dittofeed  v2.0.0 | Custom(apiKey,baseUrl)
*Customer data platform for user analytics and tracking*
**Actions:** `identify` `track` `screen`

### contentful  v2.0.0 | Custom(apiKey,space,environment)
*Content infrastructure for digital teams*
**Actions:** `contentful_record_search` `contentful_record_get` `contentful_record_create` `custom_api_call`

### datocms  v2.0.0 | Custom(apiKey,environment)
*Dato is a modern headless CMS*
**Actions:** `custom_api_call`

### posthog  v2.0.0 | API Key
*Open-source product analytics*
**Actions:** `create_event` `create_project` `custom_api_call`

### mixpanel  v2.0.0 | API Key
*Simple and powerful product analytics that helps everyone make better decisions*
**Actions:** `track_event` `custom_api_call`

### segment  v2.0.0 | API Key
*Collect and route your customer data with Segment. Identify users and track their behavior across di*
**Actions:** `identifyUser`

### cloutly  v2.0.0 | API Key
*Review Management Tool*
**Actions:** `sendReviewInvite` `custom_api_call`

### circle  v2.0.0 | API Key
*Circle.so is a platform for creating and managing communities.*
**Triggers:** `new_post_created` `new_member_added`
**Actions:** `create_post` `create_comment` `add_member_to_space` `find_member_by_email` `get_post_details` `get_member_details` `custom_api_call`

### bettermode  v2.0.0 | Custom(region,domain,email,password)
*Feature-rich engagement platform. Browse beautifully designed templates, each flexible for precise c*
**Actions:** `create_discussion` `create_question` `assign_badge` `revoke_badge` `custom_api_call`

### bitly  v2.0.0 | Custom(accessToken)
*URL shortening and link management platform with analytics.*
**Triggers:** `new_bitlink_created`
**Actions:** `archive_bitlink` `create_bitlink` `create_qr_code` `get_bitlink_details` `update_bitlink` `custom_api_call`

### short-io  v2.0.0 | Custom(apiKey)
*Create, manage, and track branded short links with Short.io,Automate link creation, monitor clicks, *
**Triggers:** `new_link_created`
**Actions:** `create-country-targeting-rule` `create-short-link` `delete-short-link` `expire-short-link` `get-domain-statistics` `get-short-link-info-by-path` `get-link-clicks` `list-short-links` `update-short-link` `custom_api_call`

### zoho-campaigns  v2.0.1 | OAuth2
*Zoho Campaigns is an email marketing platform for managing mailing lists, sending campaigns, trackin*
**Triggers:** `newContact` `unsubscribe` `newCampaign`
**Actions:** `createCampaign` `cloneCampaign` `sendCampaign` `addUpdateContact` `addTagToContact` `removeTag` `unsubscribeContact` `addContactToMailingList` `create_tag` `create_topic` `move_to_do_not_mail` `findContact` `findCampaign` `get_all_tags` `list_custom_fields`

### systeme-io  v2.0.0 | API Key
*Systeme.io is a CRM platform that allows you to manage your contacts, sales, and marketing campaigns*
**Triggers:** `newContact` `newSale` `newTagAddedToContact`
**Actions:** `createContact` `addTagToContact` `removeTagFromContact` `findContactByEmail` `updateContact`

### acuity-scheduling  v2.0.0 | OAuth2
*Acuity Scheduling is online appointment scheduling software that helps businesses manage bookings, c*
**Triggers:** `appointment_canceled` `new_appointment`
**Actions:** `add_blocked_time` `create_appointment` `create_client` `reschedule_appointment` `update_client` `find_appointment` `find_client` `custom_api_call`

### sessions-us  v2.0.0 | API Key
*Video conferencing platform for businesses and professionals*
**Triggers:** `booking_created` `booking_started` `booking_ended` `event_created` `event_published` `event_started` `event_ended` `event_new_registration` `session_created` `session_started` `session_ended` `takeaway_ready` `transcript_ready`
**Actions:** `create_session` `create_event` `publish_event` `custom_api_call`

### frame  v2.0.0 | API Key
*Collaborative workspace platform*
**Triggers:** `frame_trigger_project_created` `frame_trigger_asset_created` `frame_trigger_comment_created`
**Actions:** `custom_api_call`

### pinterest  v2.0.0 | OAuth2
*Expand your reach on Pinterest. Create and manage pins and boards, find content, and track new follo*
**Triggers:** `newBoard` `newFollower` `newPinOnBoard`
**Actions:** `createPin` `createBoard` `deletePin` `findBoardByName` `findPin` `updateBoard`

### reddit  v2.0.0 | OAuth2
*Interact with Reddit - fetch and submit posts.*
**Actions:** `retrieveRedditPost` `getRedditPostDetails` `createRedditPost` `createRedditComment` `fetchPostComments` `editRedditPost` `editRedditComment` `deleteRedditPost` `deleteRedditComment` `custom_api_call`

## ★ FORMS & SURVEYS

### typeform  v2.0.1 | OAuth2
*Typeform is a web-based platform you can use to create anything from surveys to apps. It makes colle*
**Triggers:** `new_submission` `new_entry_legacy`
**Actions:** `create_form` `create_workspace` `duplicate_form` `update_choice_options` `lookup_responses` `custom_api_call`

### tally  v2.0.0 | None
*Receive form submissions from Tally forms*
**Triggers:** `new-submission`

### jotform  v2.0.0 | Custom(apiKey,region)
*Create online forms and surveys*
**Triggers:** `new_submission`
**Actions:** `custom_api_call`

### fillout-forms  v2.0.0 | API Key
*Create interactive forms and automate workflows with Fillout*
**Triggers:** `new-form-response`
**Actions:** `getFormResponses` `getSingleResponse` `findFormByTitle` `custom_api_call`

### cognito-forms  v2.0.0 | API Key
*Build powerful online forms and manage entries with Cognito Forms. Automate form submission tracking*
**Triggers:** `new_entry` `entry_updated`
**Actions:** `create_entry` `update_entry` `delete_entry` `get_entry` `custom_api_call`

### kizeo-forms  v2.0.0 | API Key
*Create custom mobile forms*
**Triggers:** `event_on_data` `event_on_data_deleted` `event_on_data_finished` `event_on_data_pushed` `event_on_data_received` `event_on_data_updated`
**Actions:** `get_data_definition` `push_data` `download_standard_pdf` `download_custom_export_in_its_original_format` `get_list_definition` `get_list_item` `get_all_list_items` `create_list_item` `edit_list_item` `delete_list_item` `custom_api_call`

### paperform  v2.0.0 | API Key
*Create beautiful forms, manage submissions, and automate your e-commerce workflows with Paperform. C*
**Triggers:** `new_form_submission` `new_partial_form_submission`
**Actions:** `deleteFormSubmission` `deletePartialFormSubmission` `createFormCoupon` `updateFormCoupon` `deleteFormCoupon` `createFormProduct` `updateFormProduct` `deleteFormProduct` `createSpace` `updateSpace` `findFormProduct` `findForm` `findSpace` `custom_api_call`

### formstack  v2.0.0 | OAuth2
*Trigger workflows when a new submission is received*
**Triggers:** `newSubmission` `newForm`
**Actions:** `createSubmission` `findFormByNameOrId` `getSubmissionDetails` `findSubmissionByFieldValue` `custom_api_call`

### gravityforms  v2.0.0 | None
*Build and publish your WordPress forms*
**Triggers:** `new-submission`

### formbricks  v2.0.0 | Custom(appUrl,apiKey)
*Open source Survey Platform*
**Triggers:** `formbricks_trigger_response_created` `formbricks_trigger_response_updated` `formbricks_trigger_response_finished`
**Actions:** `custom_api_call`

### wufoo  v2.0.0 | Custom(apiKey,subdomain)
*Create and manage your online forms with Wufoo. Automate form entry creation, search for submissions*
**Triggers:** `new_form_entry` `new_form_created`
**Actions:** `create-form-entry` `find-form` `find-submission-by-field` `get-entry-details` `custom_api_call`

### zoho-forms  v2.0.0 | OAuth2
*Online form builder and data collection tool by Zoho*
**Triggers:** `new_form_created` `new_form_submission`
**Actions:** `get_all_forms` `get_form_details` `custom_api_call`

### airtable  v2.0.0 | API Key
*Low‒code platform to build apps.*
**Triggers:** `new_record` `updated_record`
**Actions:** `airtable_create_record` `airtable_find_record` `airtable_update_record` `airtable_delete_record` `airtable_upload_file_to_column` `airtable_add_comment_to_record` `airtable_create_base` `airtable_create_table` `airtable_find_base` `airtable_find_table_by_id` `airtable_get_record_by_id` `airtable_find_table` `airtable_get_base_schema` `custom_api_call`

### apitable  v2.0.0 | Custom(token,apiTableUrl)
*Interactive spreadsheets with collaboration*
**Triggers:** `new_record`
**Actions:** `apitable_create_record` `apitable_update_record` `apitable_find_record` `custom_api_call`
`new_record` props:
  space_id★(DROPDOWN)
  datasheet_id★(DROPDOWN)
`apitable_create_record` props:
  space_id★(DROPDOWN)
  datasheet_id★(DROPDOWN)
  fields★(DYNAMIC) //The fields to add to the record.
`apitable_update_record` props:
  space_id★(DROPDOWN)
  datasheet_id★(DROPDOWN)
  recordId★(SHORT_TEXT) //The ID of the record to update.
  fields★(DYNAMIC) //The fields to add to the record.
`apitable_find_record` props:
  space_id★(DROPDOWN)
  datasheet_id★(DROPDOWN)
  recordIds(ARRAY) //The IDs of the records to find.
  fieldNames(ARRAY) //The returned record results are limited to the specified fie
  maxRecords(NUMBER) //How many records are returned in total
  pageSize(NUMBER) //How many records are returned per page (max 1000)
  pageNum(NUMBER) //Specifies the page number of the page
  filter(LONG_TEXT) //The filter to apply to the records (see https://help.aitable
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### bika  v2.0.0 | Custom(token)
*Interactive spreadsheets with collaboration*
**Actions:** `bika_create_record` `bika_find_records` `bika_find_record` `bika_update_record` `bika_delete_record` `custom_api_call`

### grist  v2.0.0 | Custom(apiKey,domain)
*open source spreadsheet*
**Triggers:** `grist-new-record` `grist-updated-record`
**Actions:** `grist-create-record` `grist-search-record` `grist-update-record` `grist-upload-attachments-to-document` `custom_api_call`

### retable  v2.0.0 | API Key
*Turn your spreadsheets into smart database apps*
**Actions:** `retable_create_record` `retable_get_workspaces` `retable_get_projects` `retable_get_retables` `retable_create_workspace` `retable_create_project` `custom_api_call`

### ninox  v2.0.0 | API Key
*Manage your business data and build custom apps with Ninox. Create, update, and find records, manage*
**Triggers:** `newRecord`
**Actions:** `createRecord` `updateRecord` `deleteRecord` `uploadFile` `downloadFileFromRecord` `findRecord` `listFilesFromRecord` `custom_api_call`

### knack  v2.0.0 | Custom(apiKey,applicationId)
*Build online databases and manage your data with Knack. Create, update, delete, and search for recor*
**Actions:** `create_record` `delete_record` `find_record` `update_record` `custom_api_call`

## ★ STORAGE & FILES

### dropbox  v2.0.0 | OAuth2
*Cloud storage and file synchronization*
**Actions:** `search_dropbox` `create_new_dropbox_text_file` `upload_dropbox_file` `downloadFile` `get_dropbox_file_link` `delete_dropbox_file` `move_dropbox_file` `copy_dropbox_file` `create_new_dropbox_folder` `delete_dropbox_folder` `move_dropbox_folder` `copy_dropbox_folder` `list_dropbox_folder` `custom_api_call`

### amazon-s3  v2.0.0 | Custom(accessKeyId,secretAccessKey,bucket,endpoint,region)
*Scalable storage in the cloud*
**Triggers:** `new_file`
**Actions:** `upload-file` `read-file` `generate-signed-url` `moveFile` `deleteFile` `list-files`
`new_file` props:
  folderPath(SHORT_TEXT)
`upload-file` props:
  file★(FILE)
  fileName(SHORT_TEXT) //The File Name to use, if not set the API will try to figure 
  acl(STATIC_DROPDOWN) ["private"|"public-read"|"public-read-write"|"authenticated-read"|"aws-exec-read"|"bucket-owner-read"|"bucket-owner-full-control"]
  type(SHORT_TEXT) //Content Type of the uploaded file, if not set the API will t
`read-file` props:
  key★(SHORT_TEXT) //The key of the file to read
`generate-signed-url` props:
  key★(SHORT_TEXT) //The path/filename of the file to get
  expiresIn★(NUMBER)=10 //How long the URL should remain valid (in minutes).
`moveFile` props:
  fileKey★(SHORT_TEXT) //The key of the file to move
  folderKey★(SHORT_TEXT) //The key of the folder to move the file to
`deleteFile` props:
  key★(SHORT_TEXT) //The key of the file to delete.
`list-files` props:
  prefix(SHORT_TEXT) //The folder path to list files from (e.g., "folder/"). Leave 
  maxKeys(NUMBER)=1000 //Maximum number of files to return (1-1000)

### box  v2.0.0 | OAuth2
*Secure content management and collaboration*
**Triggers:** `new_file` `new_folder` `new_comment`
**Actions:** `custom_api_call`
`new_file` props:
  folder★(SHORT_TEXT) //The ID of the folder in which file uploads will trigger this
`new_folder` props:
  folder★(SHORT_TEXT) //The ID of the folder in which file uploads will trigger this
`new_comment` props:
  id★(SHORT_TEXT) //The ID of the item to trigger a webhook
  type★(STATIC_DROPDOWN) ["File"|"Folder"] //The type of the item to trigger a webhook
`custom_api_call` props:
  url★(DYNAMIC)
  method★(STATIC_DROPDOWN) ["GET"|"POST"|"PATCH"|"PUT"|"DELETE"|"HEAD"]
  headers★(OBJECT) //Authorization headers are injected automatically from your c
  queryParams★(OBJECT)
  body(JSON)
  response_is_binary(CHECKBOX)=false //Enable for files like PDFs, images, etc..
  failsafe(CHECKBOX)
  timeout(NUMBER)

### sftp  v2.0.0 | Custom(protocol,allow_unauthorized_certificates,host,port,username,password,privateKey,algorithm)
*Connect to FTP, FTPS or SFTP servers*
**Triggers:** `new_file`
**Actions:** `create_file` `upload_file` `read_file_content` `deleteFile` `createFolder` `deleteFolder` `listFolderContents` `renameFileOrFolder`

### cloudinary  v2.0.0 | Custom(api_key,api_secret,cloud_name)
*Cloudinary is a cloud-based image and video management platform that allows you to upload, store, ma*
**Triggers:** `new_resource` `new_tag_added_to_asset`
**Actions:** `uploadResource` `deleteResource` `createUsageReport` `findResourceByPublicId` `transformResource`
`new_resource` props:
  asset_folder(SHORT_TEXT) //The Cloudinary folder to watch for new resources. Leave empt
`new_tag_added_to_asset` props:
  resource_type(STATIC_DROPDOWN)='image' ["Image"|"Video"|"Raw"] //The type of resources to monitor for tag changes
  asset_folder(SHORT_TEXT) //Optional: Watch only assets in this specific folder. Leave e
`uploadResource` props:
  file★(FILE) //The file to upload to Cloudinary.
  public_id(SHORT_TEXT) //The public ID for the uploaded resource. If not specified, a
  folder(DROPDOWN) //Select an existing folder or type a new folder path (e.g., "
  tags(MULTI_SELECT_DROPDOWN) //Select existing tags or type new ones
  overwrite(CHECKBOX)=true //Whether to overwrite existing assets with the same public ID
  use_filename(CHECKBOX)=false //Whether to use the original file name as the public ID.
`deleteResource` props:
  deletion_mode★(STATIC_DROPDOWN)='public_ids' ["By Public IDs"|"By Tag"|"By Prefix"] //Choose how to specify assets for deletion
  resource_type★(DROPDOWN) //Select the type of resource to upload to Cloudinary.
  public_ids_dropdown(MULTI_SELECT_DROPDOWN) //Select assets to delete by their public IDs
  public_ids_manual(LONG_TEXT) //Or type comma-separated public IDs manually (up to 100). Exa
  tag_dropdown(DROPDOWN) //Select existing tags or type new ones (comma-separated)
  tag_manual(SHORT_TEXT) //Or type tag name manually to delete all assets with this tag
  prefix(SHORT_TEXT) //Delete all assets whose public ID starts with this prefix (u
  type(STATIC_DROPDOWN)='upload' ["Upload"|"Private"|"Authenticated"] //The delivery type of assets to delete
  keep_original(CHECKBOX)=false //Delete only derived assets, keep the original
  invalidate(CHECKBOX)=false //Whether to invalidate CDN cached copies. Takes a few minutes
`createUsageReport` props:
  date(DATE_TIME) //Date for the usage report. Must be within the last 3 months.
  include_breakdown(CHECKBOX)=true //Whether to include detailed breakdown of transformation type
`findResourceByPublicId` props:
  resource_type★(DROPDOWN) //Select the type of resource to upload to Cloudinary.
  public_id_dropdown(DROPDOWN) //Select an asset to find by its public ID
  public_id_manual(SHORT_TEXT) //Or enter the public ID manually if not found in dropdown (e.
  delivery_type(STATIC_DROPDOWN)='upload' ["Upload"|"Private"|"Authenticated"] //The delivery type of the asset
`transformResource` props:
  resource_type★(DROPDOWN) //Select the type of resource to upload to Cloudinary.
  public_ids_dropdown(MULTI_SELECT_DROPDOWN) //Select assets to delete by their public IDs
  public_id_manual(SHORT_TEXT) //Or enter public ID manually if not in dropdown
  width(NUMBER) //Target width in pixels
  height(NUMBER) //Target height in pixels
  crop_mode(STATIC_DROPDOWN) //How to handle resizing when aspect ratios differ
  gravity(STATIC_DROPDOWN) //Which part to focus on when cropping
  format(STATIC_DROPDOWN) ["Auto (best format for browser)"|"JPEG"|"PNG"|"WebP"|"AVIF"|"GIF"|"SVG"] //Convert to this format
  quality(STATIC_DROPDOWN) ["Auto (optimal for format)"|"High (90)"|"Good (80)"|"Medium (70)"|"Low (50)"] //Image quality/compression level
  border(SHORT_TEXT) //Add border (e.g., "5px_solid_blue", "10px_solid_#ff0000")
  radius(STATIC_DROPDOWN) ["Slight rounding (10px)"|"Rounded corners (20px)"|"Very rounded (50px)"|"Circle/Oval (max)"] //Round corners or make circular
  opacity(NUMBER) //Transparency level (0-100, where 100 is opaque)
  rotation(NUMBER) //Rotate image by degrees (0-360)
  raw_transformation(LONG_TEXT) //Advanced: Raw transformation string (e.g., "c_fill,w_300,h_2
  generate_url_only(CHECKBOX)=true //If true, only return the transformation URL. If false, also 

### backblaze  v2.0.0 | Custom(accessKeyId,secretAccessKey,bucket,endpoint,region)
*Scalable storage in the cloud*
**Triggers:** `new_backblaze_file`
**Actions:** `upload-backblaze-file` `read-backblaze-file`

### cloudconvert  v2.0.0 | OAuth2
*File conversion and processing platform supporting 200+ formats*
**Triggers:** `new_job` `job_finished` `job_failed`
**Actions:** `convert_file` `capture_website` `merge_pdf` `download_file` `archive_file` `optimize_file` `custom_api_call`

### gcloud-pubsub  v2.0.0 | Custom(json)
*Google Cloud's event streaming service*
**Triggers:** `new_message_in_topic`
**Actions:** `publish_to_topic`

### amazon-sns  v2.0.0 | Custom(accessKeyId,secretAccessKey,region,endpoint)
*Send messages to Amazon Simple Notification Service (SNS) topics.*
**Actions:** `send-message`

### amazon-sqs  v2.0.0 | Custom(accessKeyId,secretAccessKey,region)
*Send messages to Amazon Simple Queue Service (SQS) queues.*
**Actions:** `sendMessage`

### figma  v2.0.0 | OAuth2
*Collaborative interface design tool*
**Triggers:** `new_comment`
**Actions:** `get_file` `get_comments` `post_comment` `custom_api_call`

### rabbitmq  v2.0.0 | Custom(host,username,password,port,vhost)
*Connect and automate your messaging with RabbitMQ. Send messages to exchanges or queues, and trigger*
**Triggers:** `messageReceived`
**Actions:** `sendMessageToExchange` `sendMessageToQueue`

### rss  v2.0.0 | None
*Stay updated with RSS feeds*
**Triggers:** `new-item` `new-item-list`

### anyhook-graphql  v2.0.0 | Custom(proxyBaseUrl)
*AnyHook GraphQL enables real-time communication through AnyHook proxy server by allowing you to subs*
**Triggers:** `graphql_subscription_trigger`

### anyhook-websocket  v2.0.0 | Custom(proxyBaseUrl)
*AnyHook Websocket enables real-time communication through AnyHook proxy server by allowing you to su*
**Triggers:** `websocket_subscription_trigger`

## ★ DATABASES

### supabase  v2.0.0 | Custom(url,apiKey)
*The open-source Firebase alternative*
**Triggers:** `new_row`
**Actions:** `upload-file` `create_row` `update_row` `upsert_row` `delete_rows` `search_rows` `custom_api_call`

### postgres  v2.0.0 | Custom(host,port,user,password,database,enable_ssl,reject_unauthorized,certificate)
*The world's most advanced open-source relational database*
**Triggers:** `new-row`
**Actions:** `run-query`
`new-row` props:
  description(MARKDOWN) //**NOTE:** The trigger fetches the latest rows using the prov
  table★(DROPDOWN)
  order_by★(DROPDOWN) //Use something like a created timestamp or an auto-incrementi
  order_direction★(STATIC_DROPDOWN)='DESC' ["Ascending"|"Descending"] //The direction to sort by such that the newest rows are fetch
`run-query` props:
  query★(SHORT_TEXT) //Please use $1, $2, etc. for parameterized queries to avoid S
  args(ARRAY) //Arguments to be used in the query
  query_timeout(NUMBER)=30000 //An integer indicating the maximum number of milliseconds to 
  connection_timeout_ms(NUMBER)=30000 //An integer indicating the maximum number of milliseconds to 
  application_name(SHORT_TEXT) //A string indicating the name of the client application conne

### mysql  v2.0.0 | Custom(host,port,user,password,database)
*The world's most popular open-source database*
**Actions:** `find_rows` `insert_row` `update_row` `delete_row` `get_tables` `execute_query`
`find_rows` props:
  timezone(SHORT_TEXT) //Timezone for the MySQL server to use
  table★(DROPDOWN)
  condition★(SHORT_TEXT) //SQL condition, can also include logic operators, etc.
  args(ARRAY) //Arguments can be used using ? in the condition
  columns(ARRAY) //Specify the columns you want to select
`insert_row` props:
  timezone(SHORT_TEXT) //Timezone for the MySQL server to use
  table★(DROPDOWN)
  values★(OBJECT)
`update_row` props:
  timezone(SHORT_TEXT) //Timezone for the MySQL server to use
  table★(DROPDOWN)
  values★(OBJECT)
  search_column★(SHORT_TEXT)
  search_value★(SHORT_TEXT)
`delete_row` props:
  timezone(SHORT_TEXT) //Timezone for the MySQL server to use
  table★(DROPDOWN)
  search_column★(SHORT_TEXT)
  search_value★(SHORT_TEXT)
`execute_query` props:
  timezone(SHORT_TEXT) //Timezone for the MySQL server to use
  query★(SHORT_TEXT) //The query string to execute, use ? for arguments to avoid SQ
  args(ARRAY) //Arguments to use in the query, if any. Should be in the same

### mongodb  v2.0.0 | Custom(host,useAtlasUrl,database,username,password,authSource)
*Interact with your MongoDB databases. Perform CRUD operations, execute commands, and manage collecti*
**Actions:** `find_documents` `insert_documents` `update_documents` `delete_documents` `find_and_update_documents` `find_and_replace_documents` `aggregate_documents`
`find_documents` props:
  database(SHORT_TEXT) //The MongoDB database to connect to (from your authentication
  collection★(DROPDOWN)
  query(JSON) //MongoDB query to filter documents (e.g., {"status": "active"
  projection(JSON) //Fields to include or exclude (e.g., {"name": 1, "_id": 0})
  sort(JSON) //Sort criteria (e.g., {"createdAt": -1})
  limit(NUMBER) //Maximum number of documents to return
  skip(NUMBER)=0 //Number of documents to skip
`insert_documents` props:
  database(SHORT_TEXT) //The MongoDB database to connect to (from your authentication
  collection★(DROPDOWN)
  documents★(JSON) //Document(s) to insert. Can be a single document object or an
`update_documents` props:
  database(SHORT_TEXT) //The MongoDB database to connect to (from your authentication
  collection★(DROPDOWN)
  filter★(JSON) //MongoDB query to select documents to update (e.g., {"status"
  update★(JSON) //MongoDB update operations (e.g., {"$set": {"status": "comple
  upsert(CHECKBOX)=false //Insert a document if no documents match the filter
`delete_documents` props:
  database(SHORT_TEXT) //The MongoDB database to connect to (from your authentication
  collection★(DROPDOWN)
  filter★(JSON) //MongoDB query to select documents to delete (e.g., {"status"
`find_and_update_documents` props:
  database(SHORT_TEXT) //The MongoDB database to connect to (from your authentication
  collection★(DROPDOWN)
  filter★(JSON) //MongoDB query to select documents to update (e.g., {"status"
  update★(JSON) //MongoDB update operations (e.g., {"$set": {"status": "comple
  upsert(CHECKBOX)=false //Insert a document if no documents match the filter
  returnUpdated(CHECKBOX)=true //Return the documents after updates are applied
`find_and_replace_documents` props:
  database(SHORT_TEXT) //The MongoDB database to connect to (from your authentication
  collection★(DROPDOWN)
  filter★(JSON) //MongoDB query to select documents to replace (e.g., {"_id": 
  replacement★(JSON) //New document that will replace the matched documents
  upsert(CHECKBOX)=false //Insert the document if no documents match the filter
  returnDocument(STATIC_DROPDOWN)='after' ["Before Update"|"After Update"] //Which version of the document to return
`aggregate_documents` props:
  database(SHORT_TEXT) //The MongoDB database to connect to (from your authentication
  collection★(DROPDOWN)
  pipeline★(JSON) //Array of aggregation stages (e.g., [{"$match": {"status": "a

### snowflake  v2.0.1 | Custom(account,username,password,privateKey,database,role,warehouse)
*Data warehouse built for the cloud*
**Actions:** `runQuery` `runMultipleQueries` `insert-row`

### baserow  v2.0.0 | Custom(apiUrl,token)
*Open-source online database tool, alternative to Airtable*
**Actions:** `baserow_create_row` `baserow_delete_row` `baserow_get_row` `baserow_list_rows` `baserow_update_row` `custom_api_call`

### nocodb  v2.0.0 | Custom(baseUrl,apiToken,version)
*Turn any database into a smart spreadsheet with NocoDB. Create, update, delete, and search records w*
**Actions:** `nocodb-create-record` `nocodb-delete-record` `nocodb-update-record` `nocodb-get-record` `nocodb-search-records`

### surrealdb  v2.0.0 | Custom(url,database,namespace,username,password)
*Multi Model Database*
**Triggers:** `new-row`
**Actions:** `run-query`

## ★ ACCOUNTING & HR

### actualbudget  v2.0.0 | Custom(server_url,password,sync_id,encryption_password)
*Personal finance app*
**Actions:** `get_budget` `import_transaction` `import_transactions` `get_categories` `get_accounts`

### odoo  v2.0.0 | Custom(base_url,database,username,api_key)
*Open source all-in-one management software*
**Actions:** `get_contacts` `create_contact` `create_company` `get_records` `create_record` `update_record` `custom_odoo_api_call`

### zoho-mail  v2.0.2 | OAuth2
*Zoho Mail is a powerful email service that allows you to manage your email, contacts, and calendars *
**Triggers:** `new_email_received` `new_email_matching_search` `new_tagged_email`
**Actions:** `get_email_details` `mark_email_as_read` `mark_email_as_unread` `move_email` `send_email` `create_draft` `create_folder` `create_task` `create_tag` `custom_api_call`

## ★ SCHEDULING

### calendly  v2.0.1 | API Key
*Calendly is an elegant and simple scheduling tool for businesses that eliminates email back and fort*
**Triggers:** `invitee_created` `invitee_canceled` `invitee_no_show_created` `routing_form_submission` `meeting_recap_created` `event_canceled_polling`
**Actions:** `book_meeting_for_invitee` `cancel_event` `create_event` `create_one_off_meeting_link` `mark_invitee_no_show` `find_event` `find_meeting_recap` `find_meeting_recap_transcript` `find_user` `get_event` `get_event_type` `get_invitee` `get_user` `custom_api_call`

### cal-com  v2.0.0 | API Key
*Open-source alternative to Calendly*
**Triggers:** `BOOKING_CANCELLED` `BOOKING_CREATED` `BOOKING_RESCHEDULED`

### tidycal  v2.0.0 | API Key
*Streamline your scheduling*
**Triggers:** `booking_canceled` `new_booking` `new_contact`
**Actions:** `custom_api_call`

## REMAINING TOOLS

*35 additional tools:*

### aminos  v2.0.0 | Custom(base_url,access_token)
*Integrate with Aminos One to manage users.*
**Actions:** `createUser`

### ashby  v2.0.0 | Custom(apiKey)
*Manage your recruiting and hiring process with Ashby.*
**Actions:** `custom_api_call`

### binance  v2.0.0 | None
*Fetch the price of a crypto pair from Binance*
**Actions:** `fetch_crypto_pair_price`

### blockscout  v2.0.0 | None
*Blockscout is a tool for inspecting and analyzing EVM chains.*
**Actions:** `search` `check_redirect` `get_blocks` `get_main_page_blocks` `get_block_by_hash` `get_block_transactions` `get_block_withdrawals` `get_transactions` `get_main_page_transactions` `get_transaction_by_hash` `get_transaction_token_transfers` `get_transaction_internal_transactions` `get_transaction_logs` `get_transaction_raw_trace` `get_transaction_state_changes` `get_transaction_summary` `get_addresses` `get_address_by_hash` `get_address_counters` `get_address_transactions` `get_address_token_transfers` `get_address_logs` `get_address_blocks_validated` `get_address_token_balances` `get_address_tokens` `get_address_withdrawals` `get_address_coin_balance_history` `get_address_coin_balance_history_by_day` `get_tokens` `get_token_by_address` `get_token_transfers` `get_token_holders` `get_token_counters` `get_token_instances`

### brilliant-directories  v2.0.0 | Custom(api_key,site_url)
*All-in-one membership software*
**Actions:** `create_new_user` `custom_api_call`

### certopus  v2.0.0 | API Key
*Your certificates, made simple*
**Actions:** `create_credential` `custom_api_call`

### chainalysis-api  v2.0.0 | API Key
*Chainalysis Screening API allows you to check if a blockchain address is sanctioned.*
**Actions:** `checkAddressSanction`

### deepl  v2.0.0 | Custom(key,type)
*AI-powered language translation*
**Actions:** `translate_text` `custom_api_call`

### dimo  v2.0.0 | Custom(clientId,redirectUri,apiKey)
*DIMO is an open protocol using blockchain to establish universal digital vehicle identity, permissio*
**Triggers:** `battery-is-charging-trigger` `battery-power-trigger` `charge-level-trigger` `fuel-absolute-level-trigger` `fuel-relative-level-trigger` `ignition-trigger` `odometer-trigger` `speed-trigger` `tire-pressure-trigger`
**Actions:** `attestation-create-vin-vc` `device-definitions-decode-vin` `device-definitions-lookup-device-definitions` `token-exchange-get-vehicle-jwt` `identity-custom-query` `identity-total-vehicle-count` `identity-get-developer-license-info` `identity-get-vehicle-by-dev-license` `identity-get-total-vehicle-count-for-owner` `identity-get-vehicle-mmy-by-owner` `identity-get-vehicle-mmy-by-tokenid` `identity-get-sacd-for-vehicle` `identity-get-rewards-by-owner` `identity-get-reward-history-by-owner` `identity-get-device-definition-by-tokenid` `identity-get-device-definition-by-definitionid` `identity-get-owner-vehicles` `identity-get-developer-shared-vehicles-from-owner` `identity-get-dcns-by-owner` `telemetry-custom-query` `telemetry-available-signals` `telemetry-signals` `telemetry-daily-avg-speed` `telemetry-event` `telemetry-max-speed` `telemetry-vin-vc-latest` `vehicle-events-list-webhooks-action` `vehicle-events-upsert-webhook-numeric-action` `vehicle-events-upsert-webhook-boolean-action` `vehicle-events-delete-webhook-action` `vehicle-events-list-signals-action` `vehicle-events-list-subscribed-vehicles-action` `vehicle-events-list-vehicle-subscriptions-action` `vehicle-events-subscribe-vehicle-action` `vehicle-events-subscribe-all-vehicles-action` `vehicle-events-unsubscribe-vehicle-action` `vehicle-events-unsubscribe-all-vehicles-action`

### discourse  v2.0.0 | Custom(api_key,api_username,website_url)
*Modern open source forum software*
**Actions:** `create_post` `create_topic` `change_user_trust_level` `add_users_to_group` `send_private_message` `custom_api_call`

### eth-name-service  v2.0.0 | API Key
*Ethereum Name Service (ENS) is a decentralized naming system on the Ethereum blockchain.*
**Actions:** `listEnsDomains`

### hackernews  v2.0.0 | None
*A social news website*
**Actions:** `fetch_top_stories`

### mailchain  v2.0.0 | API Key
*Mailchain is a simple, secure, and decentralized communications protocol that enables blockchain-bas*
**Actions:** `getAuthenticatedUser` `sendEmail`

### matomo  v2.0.0 | Custom(domain,tokenAuth,siteId)
*Open source alternative to Google Analytics*
**Actions:** `add_annotation` `custom_api_call`

### mempool-space  v2.0.0 | None
*The mempool.space website invented the concept of visualizing a Bitcoin node's mempool as projected *
**Actions:** `get_difficulty_adjustment` `get_price` `get_historical_price` `get_address_details` `get_address_transactions` `get_address_transactions_chain` `get_address_transactions_mempool` `get_address_utxo` `validate_address` `get_mempool_blocks_fees` `get_recommended_fees` `get_block` `get_block_header` `get_block_height` `get_block_timestamp` `get_block_raw` `get_block_status` `get_block_tip_height` `get_block_tip_hash` `get_block_transaction_id` `get_block_transaction_ids` `get_block_transactions` `get_blocks_bulk` `get_transaction` `get_transaction_hex` `get_transaction_merkleblock_proof` `get_transaction_merkle_proof` `get_transaction_outspend` `get_transaction_outspends` `get_transaction_raw` `get_transaction_rbf_timeline` `get_transaction_status` `get_transaction_times` `post_transaction` `custom_api_call`

### metabase  v2.0.0 | Custom(baseUrl,apiKey)
*The simplest way to ask questions and learn from data*
**Actions:** `getQuestion` `getQuestionPngPreview` `getDashboardQuestions` `embedQuestion`

### pastebin  v2.0.0 | Custom(token,username,password)
*Simple and secure text sharing*
**Actions:** `create_paste` `get_paste_content`

### pastefy  v2.0.0 | Custom(instance_url,token)
*Sharing code snippets platform*
**Triggers:** `paste_changed`
**Actions:** `create_paste` `get_paste` `edit_paste` `delete_paste` `create_folder` `get_folder` `get_folder_hierarchy` `delete_folder` `custom_api_call`

### poper  v2.0.0 | None
*AI Driven Pop-up Builder that can convert visitors into customers,increase subscriber count, and sky*
**Triggers:** `newLead`

### qrcode  v2.0.0 | None
*Generate QR codes for your URLs, text, and other data. Easily create custom QR code images for your *
**Actions:** `text_to_qrcode`

### scenario  v2.0.0 | Basic Auth
*AI-generated gaming assets with Scenario. Create custom API calls to generate high-quality images, t*
**Actions:** `custom_api_call`

### simplepdf  v2.0.0 | None
*PDF editing and generation tool*
**Triggers:** `new-submission`

### sitespeakai  v2.0.0 | API Key
*Integrate with Sitespeakai to leverage AI-powered chatbots and enhance user interactions on your web*
**Triggers:** `newLead`
**Actions:** `sendQuery` `create_finetune` `delete_finetune`

### softr  v2.0.0 | API Key
*Build powerful apps and portals with Softr. Automate user management, database record operations, an*
**Triggers:** `newDatabaseRecord`
**Actions:** `createAppUser` `createDatabaseRecord` `deleteAppUser` `deleteDatabaseRecord` `findDatabaseRecord` `updateDatabaseRecord` `custom_api_call`

### spotify  v2.0.0 | OAuth2
*Music for everyone*
**Triggers:** `playlist_items_changed`
**Actions:** `search` `get_playback_state` `play` `pause` `set_volume` `get_playlists` `get_playlist_info` `get_playlist_items` `get_saved_tracks` `create_playlist` `update_playlist` `add_playlist_items` `remove_playlist_items` `reorder_playlist` `custom_api_call`

### surveymonkey  v2.0.0 | OAuth2
*Receive survey responses from SurveyMonkey*
**Triggers:** `new_response`
**Actions:** `custom_api_call`

### thankster  v2.0.0 | API Key
*Send personalized, handwritten-style cards with Thankster. Automate your direct mail campaigns and c*
**Actions:** `send_handwritten_cards`

### totalcms  v2.0.0 | Custom(domain,license)
*Content management system for modern websites*
**Triggers:** `new_blog_post`
**Actions:** `get_content` `get_blog_post` `save_blog_post` `save_blog_gallery` `save_blog_image` `save_date` `save_depot` `save_file` `save_gallery` `save_image` `save_text` `save_toggle` `save_video` `custom_api_call`

### vimeo  v2.0.0 | OAuth2
*Vimeo is a video hosting platform. Upload videos, monitor your library, and track new content from a*
**Triggers:** `new_video_by_search` `new_video_by_user` `new_video_liked` `new_video_mine`
**Actions:** `custom_api_call`

### webling  v2.0.0 | Custom(baseUrl,apikey)
*Manage your club or association with Webling. Retrieve calendar events and trigger workflows on data*
**Triggers:** `onEventChanged` `onChangedData`
**Actions:** `EventsById`

### what-converts  v2.0.0 | Custom(api_token,api_secret)
*Track and manage your marketing leads with WhatConverts. Automate lead creation and updates, export *
**Triggers:** `new_lead` `updated_lead`
**Actions:** `create_lead` `export_leads` `update_lead` `find_lead`

### whatsable  v2.0.0 | API Key
*Manage your WhatsApp business account*
**Actions:** `sendMessage`

### wonderchat  v2.0.0 | API Key
*Wonderchat is a no-code chatbot platform that lets you deploy AI-powered chatbots for websites quick*
**Triggers:** `newUserMessage`
**Actions:** `askQuestion` `addPage` `addTag` `removeTag`

### youtube  v2.0.2 | OAuth2
*Enjoy the videos and music you love, upload original content, and share it all with friends, family,*
**Triggers:** `new-video` `new_video_in_playlist`
**Actions:** `list_videos` `delete_video` `update_video` `search_videos` `add_video_to_playlist` `get_report` `custom_api_call`

### zoo  v2.0.0 | API Key
*Generate and iterate on 3D models from text descriptions using ML endpoints.*
**Actions:** `generate_cad_model` `kcl_completions` `text_to_cad_iteration` `list_cad_models` `get_cad_model` `give_model_feedback` `get_async_operation` `list_org_api_calls` `get_org_api_call` `list_user_api_calls` `get_user_api_call` `list_api_tokens` `create_api_token` `get_api_token` `delete_api_token` `get_center_of_mass` `convert_cad_file` `get_density` `get_mass` `get_surface_area` `get_volume` `get_openapi_schema` `return_pong` `send_modeling_command` `get_org` `update_org` `create_org` `list_org_members` `add_org_member` `get_org_member` `get_org_payment` `update_org_payment` `create_org_payment` `delete_org_payment` `get_org_balance` `list_org_invoices` `list_org_payment_methods` `get_org_subscription` `update_org_subscription` `create_org_subscription` `get_user_payment` `update_user_payment` `create_user_payment` `delete_user_payment` `get_user_balance` `list_user_invoices` `list_user_payment_methods` `get_user_subscription` `update_user_subscription` `create_user_subscription` `list_service_accounts` `create_service_account` `get_service_account` `delete_service_account` `list_org_shortlinks` `list_user_shortlinks` `create_shortlink` `update_shortlink` `delete_shortlink` `convert_angle` `convert_area` `convert_current` `convert_energy` `convert_force` `convert_frequency` `convert_length` `convert_mass` `convert_power` `convert_pressure` `convert_temperature` `convert_torque` `convert_volume` `get_user` `update_user` `delete_user` `get_extended_user` `get_oauth2_providers` `get_user_org` `get_privacy_settings` `update_privacy_settings` `get_user_session`
