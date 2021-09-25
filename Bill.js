// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: calculator;
// share-sheet-inputs: plain-text;

"use strict";

var d = {restaurant: "", date: "", total: 0, tip: 0, discount: 0, persons: [], paid: [], items: []};

//-------------------------------------------------------------------------------------------------------
async function setData() {
//  console.log("setData begin");
//  console.log(d);

  d = {
        restaurant: "Hans",
        date: "13.07.2021 22:05",
        total: 3370.06,
        tip: 10,
        discount: 374.45,
        persons: ["Dmitry", "Kirill", "Const", "Helen", "Alex"],
        paid: [100.11, 200.22, 300.33, 400.44, 500.55],
        items: [
          {name: "Vodka", amount: 1200.99, split: [1, 0, 1, 0, 1]},
          {name: "Beer", amount: 990.55, split: [1, 0, 1, 0, 1]},
          {name: "Cesar", amount: 390.99, split: [1, 0, 0, 0, 0]},
          {name: "Zurich", amount: 720.99, split: [1, 0, 0, 0, 0]},
          {name: "Coffee", amount: 440.99, split: [1, 1, 1, 0, 1]}
        ]
      };

//  console.log("setData end");
}

//-------------------------------------------------------------------------------------------------------
async function newData(p_items = "") {
//  console.log("newData begin");
//  console.log(d);

  var alert = new Alert();
  alert.title = "New Bill";
  alert.addTextField("Restaurant", "");
  alert.addTextField("No Of Persons", "").setNumberPadKeyboard();
  alert.addTextField("No Of Items", p_items).setNumberPadKeyboard();
  alert.addTextField("Total", "").setDecimalPadKeyboard();
  alert.addTextField("Tip %", "10").setDecimalPadKeyboard();
  alert.addTextField("Discount", "").setDecimalPadKeyboard();
  alert.addAction("OK");
  alert.addCancelAction("Cancel");

  var res = await alert.presentAlert();
  if (res == 0) {
    d.restaurant = alert.textFieldValue(0);

    var df = new DateFormatter()
    df.dateFormat = "dd.MM.yyyy HH:mm"
    d.date = df.string(new Date());

    var n_persons = Number(alert.textFieldValue(1));
    var n_items = Number(alert.textFieldValue(2));

    d.total = Number(alert.textFieldValue(3).replace(",", "."));
    d.tip = Number(alert.textFieldValue(4).replace(",", "."));
    d.discount = Number(alert.textFieldValue(5).replace(",", "."));

    d.persons = Array(n_persons).fill().map((_, i) => (i+1).toString());
    d.paid = Array(n_persons).fill(0.0);

    var alert_persons = new Alert();
    alert_persons.title = "Persons";
    d.persons.forEach(e => {
      alert_persons.addTextField(e, "");
    });
    alert_persons.addAction("OK");
    alert_persons.addCancelAction("Cancel");

    var res_persons = await alert_persons.presentAlert();
    if (res_persons == 0) {
      d.persons.forEach((_, i) => {
        d.persons[i] = alert_persons.textFieldValue(i);
      });
    }

    d.items = Array(n_items).fill().map((e, i) => ({name: (i+1).toString(), amount: 0, split: Array(n_persons).fill(0)}));
  }
  
//  await QuickLook.present(d, true);
//  console.log("newData end");
}

//-------------------------------------------------------------------------------------------------------
async function viewData() {
//  console.log("viewData begin");
//  console.log(d);

  var table = new UITable();
  table.showSeparators = true;

  var row;
  var cell;
  var font = new Font("Verdana", 10);
  var boldfont = new Font("Verdana-Bold", 10);
  var subfont = new Font("Verdana", 8);

  row = new UITableRow();
  cell = row.addText(d.date + " " + d.restaurant);
  cell.titleFont = boldfont;
  table.addRow(row);

  row = new UITableRow();
  cell = row.addText("Item");
  cell.titleFont = boldfont;
  cell = row.addText("Amount");
  cell.titleFont = boldfont;
  cell.rightAligned();
  var sum0 = 0.0
  var sumN = [];
  for (var person in d.persons) {
    cell = row.addText(d.persons[person]);
    cell.titleFont = boldfont;
    cell.rightAligned();
    sumN[person] = 0.0;
  }
  table.addRow(row);

  for (var item of d.items) {
    row = new UITableRow();
    cell = row.addText(item.name);
    cell.titleFont = font;
    cell = row.addText(item.amount.toFixed(2));
    var cell_tmp = cell;
    cell.titleFont = font;
    cell.rightAligned();
    sum0 += item.amount;
    var total = 0;
    var split;
    for (split in item.split) {
       total += item.split[split];
    }
    if (total == 0)
      cell_tmp.titleColor = Color.red();
    for (split in item.split) {
      if (total == 0)
        cell = row.addText("0.00", "0");
      else
        cell = row.addText((item.amount * item.split[split] / total).toFixed(2), item.split[split].toString());
      cell.titleFont = font;
      cell.subtitleFont = subfont;
      cell.rightAligned();
      if (total != 0)
        sumN[split] += item.amount * item.split[split] / total;
    }
    table.addRow(row);
  }

  if (d.discount > 0) {
    row = new UITableRow();
    cell = row.addText("Subtotal");
    cell.titleFont = boldfont;
    cell = row.addText(sum0.toFixed(2));
    cell.titleFont = boldfont;
    cell.rightAligned();
    for (split in sumN) {
      cell = row.addText(sumN[split].toFixed(2));
      cell.titleFont = boldfont;
      cell.rightAligned();
    }
    table.addRow(row);

    row = new UITableRow();
    cell = row.addText("Discount");
    cell.titleFont = font;
    cell = row.addText(d.discount.toFixed(2));
    cell.titleFont = font;
    cell.rightAligned();
    for (split in sumN) {
      if (sum0 > 0)
        cell = row.addText((d.discount * sumN[split] / sum0).toFixed(2));
      else
        cell = row.addText("0.00");
      cell.titleFont = font;
      cell.rightAligned();
    }
    table.addRow(row);
  }

  row = new UITableRow();
  cell = row.addText("Total");
  cell.titleFont = boldfont;
  cell = row.addText((sum0 - d.discount).toFixed(2));
  cell.titleFont = boldfont;
  cell.rightAligned();
  for (split in sumN) {
    if (sum0 > 0)
      cell = row.addText((sumN[split] - d.discount*sumN[split]/sum0).toFixed(2));
    else
      cell = row.addText("0.00");
    cell.titleFont = boldfont;
    cell.rightAligned();
  }
  table.addRow(row);

  row = new UITableRow();
  cell = row.addText("Bill");
  cell.titleFont = boldfont;
  cell = row.addText(d.total.toFixed(2));
  cell.titleFont = boldfont;
  cell.rightAligned();
  for (split in sumN) {
    cell = row.addText("");
  }
  table.addRow(row);

  row = new UITableRow();
  cell = row.addText("Tip");
  cell.titleFont = font;
  cell = row.addText((sum0 * d.tip / 100.0).toFixed(2));
  cell.titleFont = font;
  cell.rightAligned();
  for (split in sumN) {
    cell = row.addText((sumN[split] * d.tip / 100.0).toFixed(2));
    cell.titleFont = font;
    cell.rightAligned();
  }
  table.addRow(row);

  row = new UITableRow();
  cell = row.addText("G Total");
  cell.titleFont = boldfont;
  cell = row.addText((sum0 - d.discount + sum0*d.tip/100.0).toFixed(2));
  cell.titleFont = boldfont;
  cell.rightAligned();
  for (split in sumN) {
    if (sum0 > 0)
      cell = row.addText((sumN[split] - d.discount*sumN[split]/sum0 + sumN[split]*d.tip/100.0).toFixed(2));
    else
      cell = row.addText("0.00");
    cell.titleFont = boldfont;
    cell.rightAligned();
  }
  table.addRow(row);

  var sumPaid = 0.0;
  for (var person in d.persons)
    sumPaid += d.paid[person];
  row = new UITableRow();
  cell = row.addText("Paid");
  cell.titleFont = font;
  cell = row.addText(sumPaid.toFixed(2));
  cell.titleFont = font;
  cell.rightAligned();
  for (var person in d.persons) {
    cell = row.addText(d.paid[person].toFixed(2));
    cell.titleFont = font;
    cell.rightAligned();
  }
  table.addRow(row);

  await table.present();

//  console.log("viewData end");
}

//-------------------------------------------------------------------------------------------------------
async function editData_1() {
//  console.log("editData_1 begin");
//  console.log(d);

  var alert = new Alert();
  alert.title = "Set";
  alert.addTextField("Restaurant", d.restaurant);
  alert.addTextField("Date", d.date);
  alert.addTextField("Total", d.total.toFixed(2)).setDecimalPadKeyboard();
  alert.addTextField("Tip %", d.tip.toString()).setDecimalPadKeyboard();
  alert.addTextField("Discount", d.discount.toFixed(2)),setDecimalPadKeyboard();
  alert.addAction("OK");
  alert.addCancelAction("Cancel");

  var res = await alert.presentAlert();
  if (res == 0) {
    d.restaurant = alert.textFieldValue(0);
    d.date = alert.textFieldValue(1);
    d.total = Number(alert.textFieldValue(2).replace(",", "."));
    d.tip = Number(alert.textFieldValue(3).replace(",", "."));
    d.discount = Number(alert.textFieldValue(4).replace(",", "."));
  }
  
  var html = `
  <html>
  <head>
   <meta name="viewport" content="width=device-width">
   <meta charset="utf-8">
  <style>
    td, input {font-family: verdana; font-size: 16px;}
    .bold {
      font-weight: bold;
    }
    .vertical {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
//      text-align: center;
//      vertical-align: middle;
//      margin: 5px;
    }
  </style>
  </head>
  <body>
  <table>
    ###body###
  </table>
  </body>
  </html>
  `;

  var body = `
    <tr>
      <td><span class="bold">Item</span>
      <td><span class="bold">Amount</span>
  `;

  for (var person in d.persons) {
    body += `<td><span class="vertical bold">${d.persons[person]}</span>\n`;
  }

  for (var item in d.items) {
    body += `<tr>\n<td><input type="text" inputmode="text" size="9" value="${d.items[item].name}" data-type="name" data-item="${item}" />\n`
    body += `<td><input type="text" inputmode="decimal" size="9" value="${d.items[item].amount.toFixed(2)}" data-type="amount" data-item="${item}" />\n`
    for (var split in d.items[item].split) {
      body += `<td><input type="text" inputmode="numeric" size="1" value="${d.items[item].split[split].toString()}" data-type="split" data-item="${item}" data-person="${split}" />\n`
    }
  }
  
  html = html.replace("###body###", body);

  var js = `
    "use strict";
    var res = [];
    for (var input of document.getElementsByTagName("input")) {
      if (input.dataset.type == "name") {
        res[input.dataset.item] = {name: input.value, amount: 0, split: []};
      }
      if (input.dataset.type == "amount") {
        res[input.dataset.item].amount = Number(input.value.replace(",", "."));
      }
      if (input.dataset.type == "split") {
        res[input.dataset.item].split[input.dataset.person] = Number(input.value);
      }
    }
    completion(res);
  `

  var webview = new WebView();
  await webview.loadHTML(html);
  await webview.present(true);
  var res = await webview.evaluateJavaScript(js, true);
//  console.log(r)
  for (item in d.items) {
    d.items[item].name = res[item].name;
    d.items[item].amount = res[item].amount;
    d.items[item].split = res[item].split;
  }

//  console.log("editData_1 end");
}

//-------------------------------------------------------------------------------------------------------
async function editData_2() {
//  console.log("editData_2 begin");
//  console.log(d);

  var alert = new Alert();
  alert.title = "Set";
  alert.addTextField("Restaurant", d.restaurant);
  alert.addTextField("Date", d.date);
  alert.addTextField("Total", d.total.toFixed(2)).setDecimalPadKeyboard();
  alert.addTextField("Tip", d.tip.toString()).setDecimalPadKeyboard();
  alert.addTextField("Discount", d.discount.toFixed(2)).setDecimalPadKeyboard();
  alert.addAction("OK");
  alert.addCancelAction("Cancel");

  var res = await alert.presentAlert();
  if (res == 0) {
    d.restaurant = alert.textFieldValue(0);
    d.date = alert.textFieldValue(1);
    d.total = Number(alert.textFieldValue(2).replace(",", "."));
    d.tip = Number(alert.textFieldValue(3).replace(",", "."));
    d.discount = Number(alert.textFieldValue(4).replace(",", "."));
  }
  
  var html = `
  <html>
  <head>
   <meta name="viewport" content="width=device-width">
   <meta charset="utf-8">
  <style>
    td, input {
      font-family: verdana;
      font-size: 16px;
    }
    .bold {
      font-weight: bold;
    }
    .vertical {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
//      text-align: center;
//      vertical-align: middle;
//      margin: 5px;
    }
    .split {
      text-align: center;
      width: 40px;
      border: solid 1px;
    }
  </style>
  </head>
  <body>
  <script>
    function f(e) {
      var n = Number(e.innerText);
      if (n < 5)
        e.innerText = n + 1;
      else
        e.innerText = "0";
    }
  </script>
  <table>
    ###body###
  </table>
  </body>
  </html>
  `;

  var body = `
    <tr>
      <td><span class="bold">Item</span>
      <td><span class="bold">Amount</span>
  `;

  for (var person in d.persons) {
    body += `<td><span class="vertical bold">${d.persons[person]}</span>\n`;
  }

  for (var item in d.items) {
    body += `<tr>\n<td><input type="text" inputmode="text" size="9" value="${d.items[item].name}" data-type="name" data-item="${item}" />\n`
    body += `<td><input type="text" inputmode="decimal" size="9" value="${d.items[item].amount.toFixed(2)}" data-type="amount" data-item="${item}" />\n`
    for (var split in d.items[item].split) {
      body += `<td class="split" onclick="f(this);" data-type="split" data-item="${item}" data-person="${split}">${d.items[item].split[split].toString()}</td>\n`
    }
  }
  
  html = html.replace("###body###", body);

  var js = `
    "use strict";

    var res = [];
    for (var input of document.getElementsByTagName("input")) {
      if (input.dataset.type == "name") {
        res[input.dataset.item] = {name: input.value, amount: 0, split: []};
      }
      if (input.dataset.type == "amount") {
        res[input.dataset.item].amount = Number(input.value.replace(",", "."));
      }
    }
    for (var split of document.getElementsByClassName("split")) {
      if (split.dataset.type == "split") {
        res[split.dataset.item].split[split.dataset.person] = Number(split.innerText);
      }      
    }
    completion(res);
  `

  var webview = new WebView();
  await webview.loadHTML(html);
  await webview.present(true);
  var res = await webview.evaluateJavaScript(js, true);
//  console.log(r)
  for (item in d.items) {
    d.items[item].name = res[item].name;
    d.items[item].amount = res[item].amount;
    d.items[item].split = res[item].split;
  }

//  console.log("editData_2 end");
}

//-------------------------------------------------------------------------------------------------------
async function editData_3() {
//  console.log("editData_3 begin");
//  console.log(d);

  var alert = new Alert();
  alert.title = "Set";
  alert.addTextField("Restaurant", d.restaurant);
  alert.addTextField("Date", d.date);
  alert.addTextField("Total", d.total.toFixed(2)).setDecimalPadKeyboard();
  alert.addTextField("Tip", d.tip.toString()).setDecimalPadKeyboard();
  alert.addTextField("Discount", d.discount.toFixed(2)).setDecimalPadKeyboard();
  alert.addAction("OK");
  alert.addCancelAction("Cancel");

  var res = await alert.presentAlert();
  if (res == 0) {
    d.restaurant = alert.textFieldValue(0);
    d.date = alert.textFieldValue(1);
    d.total = Number(alert.textFieldValue(2).replace(",", "."));
    d.tip = Number(alert.textFieldValue(3).replace(",", "."));
    d.discount = Number(alert.textFieldValue(4).replace(",", "."));
  }
  
  var html = `
<html>
<head>
<meta name="viewport" content="width=device-width">
<meta charset="utf-8">
<style>
  :root {
    font-family: verdana;
    font-size: 1em;
  }
  table {
    font-size: 1rem;
  }
  thead th {
    top: 0;
    position: sticky;
    background-color: #ddd;
    padding: 3px;
  }
  .member {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    vertical-align: bottom;
    text-align: center;
//    white-space: nowrap;
  }
  .meal {
    font-size: 1rem;
    font-family: inherit;
    width: 7.5em;
  }
  .sum {
    font-size: 1rem;
    font-family: inherit;
    text-align: right;
    width: 5.5em;
  }
  .value {
    width: 1.8em;
    height: 1.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: solid 1px;
    border-radius: 0.3em;
    margin: 1px auto;
  }
  .expand {
    font-size: 1.25rem;
    height: 1.8em;
    width: 1.8em;
  }
  .button {
    font-size: 1.25rem;
    height: 1.8em;
    width: 1.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: solid 1px;
    border-radius: 0.3em;
  }
</style>
</head>
<body onclick="c(event.target);">
<script>
  function c(e) {
    switch (e.tagName) {
      case 'DIV':
        if (e.classList.contains('button')) {
          var v = e.parentNode.querySelector('.value');
          if (e.classList.contains('plus')) {
            v.innerText = Number(v.innerText) + 1;
          }
          if (e.classList.contains('minus')) {
            if (Number(v.innerText) > 0)
             v.innerText = Number(v.innerText) - 1;
          }
        } else {
          for (i of document.getElementsByClassName('expand')) {
            if (i != e)
              c(i);
          }
          e.classList.toggle('expand');
          var plus = e.parentNode.querySelector('.plus');
          var minus = e.parentNode.querySelector('.minus');
          plus.classList.toggle('button');
          minus.classList.toggle('button')
          if (e.classList.contains('expand')) {
            plus.innerHTML = '+';
            minus.innerHTML = '-';
          } else {
            plus.innerHTML = '';
            minus.innerHTML = '';
          }
        }
        break;
      default:
        for (i of document.getElementsByClassName('expand'))
          c(i);
        break;
    }
  }
</script>
<table>
  ###body###
</table>
</body>
</html>
  `;

  var body = `
<thead>
  <tr>
    <th style="text-align: left;">Item</th>
    <th style="text-align: right;">Amount</th>
  `;

  d.persons.forEach(person => {
    body += `<th><span class="member">${person}</span></th>\n`;
  });

  body += `
  </tr>
</thead>
<tbody>
  `;

  d.items.forEach((item, i) => {
    body += `<tr>\n<td><input class="meal" type="text" value="${item.name}" data-type="name" data-item="${i}" />\n`;
    body += `<td><input class="sum" type="text" inputmode="decimal" value="${item.amount.toFixed(2)}" data-type="amount" data-item="${i}" />\n`;
    item.split.forEach((split, s) => {
      body += `<td><div class="plus"></div><div class="value" data-type="split" data-item="${i}" data-person="${s}">${split.toString()}</div><div class="minus"></div></td>\n`;
    });
    body += "</tr>\n";
  });

  body += '</tbody>\n';
  
  html = html.replace("###body###", body);

  var js = `
    "use strict";

    var res = [];
    for (var input of document.getElementsByTagName("input")) {
      if (input.dataset.type == "name") {
        res[input.dataset.item] = {name: input.value, amount: 0, split: []};
      }
      if (input.dataset.type == "amount") {
        res[input.dataset.item].amount = Number(input.value.replace(",", "."));
      }
    }
    for (var split of document.getElementsByClassName("value")) {
      if (split.dataset.type == "split") {
        res[split.dataset.item].split[split.dataset.person] = Number(split.innerText);
      }      
    }
    completion(res);
  `;

  var webview = new WebView();
  await webview.loadHTML(html);
  await webview.present(true);
  var res = await webview.evaluateJavaScript(js, true);
  d.items.forEach((item, i) => {
    item.name = res[i].name;
    item.amount = res[i].amount;
    item.split = res[i].split;
  });

//  console.log("editData_3 end");
}

//-------------------------------------------------------------------------------------------------------
async function modifyData() {
//  console.log("modifyData begin");
//  console.log(d);

  var alert = new Alert();
  alert.title = "Select Action";
  alert.addAction("Add Item");
  alert.addAction("Delete Item");
  alert.addAction("Add Person");
  alert.addAction("Delete Person");
  alert.addAction("Edit Persons");
  alert.addAction("Edit Payments");
  alert.addAction("Cancel");

  var res = await alert.presentSheet();

// Add Item
  if (res == 0) {
    var split = [];
    for (var person in d.persons)
      split[person] = 0;
    d.items.push({name: "", amount: 0, split: split});
  }

// Delete Item
  if (res == 1) {
    var alert_items = new Alert();
    alert_items.title = "Delete Item";
    for (var item in d.items)
      alert_items.addAction(`${d.items[item].name} (${d.items[item].amount.toFixed(2)})`);
    alert_items.addCancelAction("Cancel");
    var res_items = await alert_items.presentSheet()
    if (res_items != -1) {
      d.items.splice(res_items, 1);
    }
  }

// Add Person
  if (res == 2) {
    var alert_person = new Alert();
    alert_person.title = "Add Person";
    alert_person.addTextField("Name", "");
    alert_person.addAction("OK");

    await alert_person.presentAlert();
    d.persons.push(alert_person.textFieldValue(0));
    d.paid.push(0.0);
    for (var item in d.items)
      d.items[item].split.push(0);
  }

// Delete Person
  if (res == 3) {
    var alert_persons = new Alert();
    alert_persons.title = "Delete Person";
    for (var person in d.persons)
      alert_persons.addAction(d.persons[person]);
    alert_persons.addCancelAction("Cancel");
    var res_persons = await alert_persons.presentSheet()
    if (res_persons != -1) {
      d.persons.splice(res_persons, 1);
      d.paid.splice(res_persons, 1);
      for (var item in d.items) {
        d.items[item].split.splice(res_persons, 1);
      }
    }
  }

// Edit Persons
  if (res == 4) {
    var alert_persons = new Alert();
    alert_persons.title = "Edit Persons";
    for (var person in d.persons) {
      alert_persons.addTextField((Number(person)+1).toString(), d.persons[person]);
    }
    alert_persons.addAction("OK");
    alert_persons.addCancelAction("Cancel");

    var res_persons = await alert_persons.presentAlert();
    if (res_persons == 0) {
      for (var person in d.persons) {
        d.persons[person] = alert_persons.textFieldValue(person);
      }
    }
  }

// Edit Payments
  if (res == 5) {
    var alert_paid = new Alert();
    alert_paid.title = "Edit Payments";
    for (var person in d.persons) {
//      alert_paid.addAction(d.persons[person]);
      alert_paid.addTextField(d.persons[person], d.paid[person].toFixed(2)).setDecimalPadKeyboard();
    }
    alert_paid.addAction("OK");
    alert_paid.addCancelAction("Cancel");

    var res_paid = await alert_paid.presentAlert();
    console.log(res_paid);
    if (res_paid == 0) {
      for (var person in d.persons) {
        d.paid[person] = Number(alert_paid.textFieldValue(person).replace(",", "."));
      }
    }
  }

//  console.log("modifyData end");
}

//-------------------------------------------------------------------------------------------------------
async function openData() {
//  console.log("openData begin");
//  console.log(d);

  var filename = await DocumentPicker.openFile();
  var fm = FileManager.iCloud();
  await fm.downloadFileFromiCloud(filename);
  var s = fm.readString(filename);
  d = JSON.parse(s);

//  console.log("openData end");
}

//-------------------------------------------------------------------------------------------------------
async function saveData() {
//  console.log("saveData begin");
//  console.log(d);

  try {
    var data = Data.fromString(JSON.stringify(d, null, 2));
    var df = new DateFormatter()
    df.dateFormat = "dd.MM.yyyy HH:mm"
    var date = df.date(d.date);
    df.dateFormat = "YYYYMMdd";
    var filename = df.string(date) + " " + d.restaurant + ".txt";
    var res = await DocumentPicker.exportData(data, filename);
  } catch(error) {
    console.log(error);
  }

//  console.log("saveData end");
}

//-------------------------------------------------------------------------------------------------------
async function saveHTMLData() {
//  console.log("saveHTMLData begin");
//  console.log(d);

  var html = `
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <style>
        .amount {
          text-align: right;
          width: 60px;
        }
        .bold {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      ###body###    
    </body>
    </html>
  `;

  var sum0 = 0;
  var sumN = [];
  var body = ""
  body += "<table>\n";
  body += `<tr><td class="bold">Item<td class="amount bold">Amount`;
  for (var person in d.persons) {
    body += `<td class="amount bold">${d.persons[person]}`;
    sumN[person] = 0;
  }
  body += '\n';

  for (var item in d.items) {
    sum0 += d.items[item].amount;
    body += `<tr><td>${d.items[item].name}<td class="amount">${d.items[item].amount.toFixed(2)}`;
    var total = 0;
    for (var split in d.items[item].split)
      total += d.items[item].split[split];
    for (var split in d.items[item].split) {
      if (total != 0) {
        sumN[split] += d.items[item].amount * d.items[item].split[split] / total;
        body += `<td class="amount">${(d.items[item].amount * d.items[item].split[split] / total).toFixed(2)}`;
      } else {
        body += `<td class="amount">0.00`;
      }

    }
    body += '\n';
  }

  if (d.discount > 0) {
    body += `<tr><td class="bold">Subtotal<td class="amount bold">${sum0.toFixed(2)}`;
    for (var person in d.persons)
      body += `<td class="amount bold">${sumN[person].toFixed(2)}`;
    body += '\n';

    body += `<tr><td>Discount<td class="amount">${d.discount.toFixed(2)}`;
    for (var person in d.persons) {
      if (sum0 > 0)
        body += `<td class="amount">${(d.discount * sumN[person] / sum0).toFixed(2)}`;
      else
        body += `<td class="amount">0.00`;
    }
    body += '\n';
  }

  body += `<tr><td class="bold">Total<td class="amount bold">${(sum0 - d.discount).toFixed(2)}`;
  for (var person in d.persons) {
    if (sum0 > 0)
      body += `<td class="amount bold">${(sumN[person] - d.discount*sumN[person]/sum0).toFixed(2)}`;
    else
      body += `<td class="amount bold">0.00`;
  }
  body += '\n';

  body += `<tr><td>Tip<td class="amount">${(sum0 * d.tip / 100).toFixed(2)}`;
  for (var person in d.persons)
    body += `<td class="amount">${(sumN[person] * d.tip / 100).toFixed(2)}`;
  body += '\n';

  body += `<tr><td class="bold">G Total<td class="amount bold">${(sum0 - d.discount + sum0*d.tip/100).toFixed(2)}`;
  for (var person in d.persons) {
    if (sum0 > 0)
      body += `<td class="amount bold">${(sumN[person] - d.discount*sumN[person]/sum0 + sumN[person]*d.tip/100).toFixed(2)}`;
    else
      body += `<td class="amount bold">0.00`;
  }
  body += '\n';

  body += "</table>\n";

  html = html.replace("###body###", body);

  var webview = new WebView();
  await webview.loadHTML(html);
  await webview.present(true);

  try {
    var data = Data.fromString(html);
    var df = new DateFormatter()
    df.dateFormat = "dd.MM.yyyy HH:mm"
    var date = df.date(d.date);
    df.dateFormat = "YYYYMMdd";
    var filename = df.string(date) + " " + d.restaurant + ".html";
//    var filename = "bill.html";
    var f = await DocumentPicker.exportData(data, filename);
  } catch(error) {
    console.log(error);
  }
  
//  console.log("saveHTMLData end");
}

//-------------------------------------------------------------------------------------------------------
async function readData() {
//  console.log("readData begin");
//  console.log(d);

  var text = "";
  var items = [];

  if (args.plainTexts.length == 0) {
    return;
  } else {
    text = args.plainTexts[0];
  }

  for (var line of text.split('\n')) {
    var m = line.match(/^\s*(.*?)\s+([0-9.,]+)\s*$/);
    if (m) {
      items.push({name: m[1], amount: Number(m[2].replace(',', '.'))});
    }
  }

  await newData(items.length.toString());

  for (var i in items) {
    d.items[i].name = items[i].name;
    d.items[i].amount = items[i].amount;
  }

//  console.log("readData end");
}

//-------------------------------------------------------------------------------------------------------
async function menu() {
//  console.log("menu begin");
//  console.log(d);

  var stop = false;

  while (!stop) {
    var alert = new Alert();
    alert.title = "Select Action";
    alert.addAction("Open Bill");
    alert.addAction("New Bill");
    alert.addAction("Edit Bill");
    alert.addAction("Modify Bill");
    alert.addAction("View Bill");
    alert.addAction("Save Bill");
    alert.addAction("Save HTML Bill");
    alert.addAction("Exit");
    alert.addAction("Set Test Bill");

    var res = await alert.presentSheet();
    switch (res) {
      case -1:
        stop = true;
        break;
      case 0:
        await openData();
        break;
      case 1:
        await newData();
        break;
      case 2:
        await editData_3();
        break;
      case 3:
        await modifyData();
        break;
      case 4:
        await viewData();
        break;
      case 5:
        await saveData();
        break;
      case 6:
        await saveHTMLData();
        break;
      case 7:
        stop = true; 
        break;
      case 8:
        await setData();
        break;
      default:
        console.log("Error: unknown menu");    
        console.log(res);
        break;
    }
  }

  Script.complete();
//  console.log("menu end");
}

//try {
  await readData();
  await menu();
//} catch(error) {
//  console.log(error);
//  console.log(error.stack);
//}
