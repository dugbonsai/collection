var _groupHeaders = [],
	_groups = [],
	_category = "",
	_groupIDs = [],
	_groupIndex = "",
	_groupName = ""
	_imageArray =[],
	_imageIndex = 0, 
	_item = "",
	_currentItem = null;

_groupHeaders["modelScale"] = "Model Scales";
_groupHeaders["modelBrand"] = "Model Brands";
_groupHeaders["year"] = "Years";
_groupHeaders["originalManufacturer"] = "1:1 Manufacturers";
_groupHeaders["originalModel"] = "1:1 Models";
_groupHeaders["competitionDriver1"] = "Drivers";
_groupHeaders["competitionDriver2"] = "Co-Drivers";
_groupHeaders["competitionClass"] = "Classes";

function onClickCategory(category) {
	window.location.href = window.location.protocol + "//" + window.location.hostname + "/groups.html?category=" + category;
}

function getQueryParams() {
	var index = location.href.indexOf("?");

	if (index != -1) {
		var queryString = location.href.substring(index + 1, location.href.length);
		var categoryIndex = queryString.indexOf("category");
		var groupIndexIndex = queryString.indexOf("groupIndex");
		var groupNameIndex = queryString.indexOf("groupName");
		var itemIndex = queryString.indexOf("item");
		var ampersandIndex = -1;

		if (categoryIndex != -1) {
			_category = queryString.substring(categoryIndex + 9, queryString.length);
			ampersandIndex = _category.indexOf("&");
			if (ampersandIndex != -1) {
				_category = _category.substring(0, ampersandIndex);
			}
		}
		
		if (groupIndexIndex != -1) {
			_groupIndex = queryString.substring(groupIndexIndex + 11, queryString.length);
			ampersandIndex = _groupIndex.indexOf("&");
			if (ampersandIndex != -1) {
				_groupIndex = _groupIndex.substring(0, ampersandIndex);
			}
		}
		
		if (groupNameIndex != -1) {
			_groupName = queryString.substring(groupNameIndex + 10, queryString.length);
			ampersandIndex = _groupName.indexOf("&");
			if (ampersandIndex != -1) {
				_groupName = _groupName.substring(0, ampersandIndex);
			}
		}

		if (itemIndex != -1) {
			_item = queryString.substring(itemIndex + 5, queryString.length);
			ampersandIndex = _groupName.indexOf("&");
			if (ampersandIndex != -1) {
				_item = _item.substring(0, ampersandIndex);
			}
		}
	}
}

function groupsOnLoadHandler() {
	getQueryParams();
	if (_category != "") {
		getCategoryGroupList(_category, "");
	}
}

function getCategoryGroupList(category, groupName) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', category + "/groups.json", true);
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			gotCategoryGroupList(category, this.responseText, groupName);
		}
	};

	xhr.send();
}

function gotCategoryGroupList(category, responseText)
{
	if (_groupName == "") {
		// This is the case when clicking a category on index.html
		_groups = JSON.parse(responseText).groups;
	
		var content= "";
		for (var i = 0; i < _groups.length;i++) {
			content += '<div id="' + i + '" class="row"><a href="javascript:onClickGroup(\'' + category + '\',\'' + i + '\')">' + _groups[i] + '</a><br/></div>';
		}
	
		document.getElementById("groupsHeader").innerHTML = _groupHeaders[category];
		document.getElementById("groupsList").innerHTML = content;
	} else {
		// This is the case when clicking a group on item.html
		_groupIndex = JSON.parse(responseText).groups.indexOf(decodeURI(_groupName));
		getItemsDivContent(category, _groupIndex, _groupName);
	}
}

function onClickGroup(category, groupIndex) {
	window.location.href = window.location.protocol + "//" + window.location.hostname + "/items.html?category=" + category + "&groupIndex=" + groupIndex + "&groupName=" + _groups[groupIndex];
}

function itemsOnLoadHandler() {
	getQueryParams();
	if (_groupIndex == "") {
		getCategoryGroupList(_category, _groupName);
	} else {
		getItemsDivContent(_category, _groupIndex, _groupName);
	}
}

function getItemsDivContent(category, groupIndex, groupName)
{
	var xhr=new XMLHttpRequest();
	xhr.open('GET', category + "/group_" + groupIndex + ".json", true);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			gotItemsDivContent(groupName, this.responseText);
		}
	};
	
	xhr.send();
}

function gotItemsDivContent(groupName, responseText)
{
	document.getElementById("itemsHeader").innerHTML = decodeURIComponent(groupName);

	var json = JSON.parse(responseText),
		html = '<table>',
		item = 0;

	_groupIDs = [];
	for (item = 0; item < json.items.length; item ++) {
		html += '<tr class="row">';
		html += '<td>';
		html += '<div class="imageDiv">';
		html += '<span></span>';
		html += '<a href="javascript:onClickItem(' + item + ')"><img border="0" src="';
		html += (json.items[item].image == undefined) ? 'images/placeholder_100.png"/>' : (json.items[item].id + '/images/' + json.items[item].image + '_100.png"/>');
		html += '</div>';
		html += '</td>';
		html += '<td class="labelDiv">';
		html += '<a href="javascript:onClickItem(' + item + ')"><p>' + json.items[item].text + '</p></a><br/>';
		html += '</td>';
		html += '</tr>';
		_groupIDs[item] = json.items[item].id;
	}

	html += '</table>';
	document.getElementById("items").innerHTML = html;
}

function onClickItem(item)
{
	window.location.href = window.location.protocol + "//" + window.location.hostname + "/item.html?category=" + _category + "&groupIndex=" + _groupIndex + "&groupName=" + _groupName + "&item=" + _groupIDs[item];
}

function itemOnLoadHandler() {
	// 	"/item.html?category=" + _category + "&groupIndex=" + _groupIndex + "&groupName=" + groupsByCategory[_category][_groupIndex] + "&item=" + _groupIDs[_item]; 
	//	OR
	// 	"/item.html?item=" + _groupIDs[_item]; 
	getQueryParams()
	if (_item != "" && _category == "" && _groupIndex == "" && _groupName == "") {
		selectItem(_item);
	} else {
		getItemList(_category, _groupIndex, _item)
		_currentItem = _item;
	}
}

function onClickHome() {
	window.location.href = window.location.protocol + "//" + window.location.hostname + "/index.html";
}	

function selectItem(item)
{
	getItemDetailsDivContent(item);
	_currentItem = item;
}

function getItemDetailsDivContent(item) {
	var xhr = new XMLHttpRequest();

	xhr.open('GET',"" + item + "/" + item + ".json", true);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			gotItemDetailsDivContent(item, this.responseText);
		}
	};

	xhr.send();
}

function gotItemDetailsDivContent(item, responseText) {
	var json = JSON.parse(responseText),
		html = '<div id="baselayer">',
		image = 0;

	_imageArray = [];
	_imageIndex = 0;

	html += '<div id="bg_mask">';
	html += '<div id="frontlayer">';
	html += '<table class="detailsTable">';
	html += '<tr>';

	if (json.images !== undefined && json.images.length > 1) {
		html += '<td onclick="previousImage()">';
		html += '<div id="divPreviousImage" class="imageNav">&lt;</div>';
		html += '</td>';
	}

	html += '<td>';
	html += '<div onclick="onClickImage();" class="imageClose">x</div>';
	html += '<div><img class="center-fit" id="popupImage" src="" onclick="onClickImage();""/></div>';
	html += '</td>';

	if (json.images !== undefined && json.images.length > 1) {
		html += '<td onclick="nextImage()">';
		html += '<div id="divNextImage" class="imageNav">&gt;</div>';
		html += '</td>';
	}

	html += '</tr>';
	html += '</table>';
	html += '</div>';
	html += '</div>';

	if (_groupIDs.length > 1) {
		html += '<button class="itemNav" onclick="onClickPreviousItemButton()">&lt; Previous Item</button>';
		html += '&nbsp;&nbsp;&nbsp;';
		html += '<button class="itemNav" onclick="onClickNextItemButton()">Next Item &gt;</button>';
		html += '<hr/>';
	} else {
		html += '<button class="itemNav" onclick="onClickHome()">&lt;-- Home</button>';
		html += '<hr/>';
	}

	if (hasValue(json.scale)) {
		html += '<b>Scale:</b> <a href="javascript:selectCategoryAndGroup(\'modelScale\',\'' + json.scale + '\')">' + json.scale + '</a><br/>';
	}

	if (hasValue(json.brand)) {
		html += '<b>Brand:</b> <a href="javascript:selectCategoryAndGroup(\'modelBrand\',\'' + json.brand + '\')">' + json.brand + '</a><br/>';
	}

	if (hasValue(json.catalogNo)) {
		html += '<b>Catalog No.:</b> ' + json.catalogNo + '<br/>';
	}

	if (hasValue(json.year)) {
		html += '<b>Year:</b> <a href="javascript:selectCategoryAndGroup(\'year\',\'' + json.year + '\')">' + json.year + '</a><br/>';
	}

	if (hasValue(json.manufacturer)) {
		html += '<b>Manufacturer:</b> <a href="javascript:selectCategoryAndGroup(\'originalManufacturer\',\'' + json.manufacturer + '\')">' + json.manufacturer + '</a><br/>';
	}

	if (hasValue(json.model)) {
		html += '<b>Model:</b> <a href="javascript:selectCategoryAndGroup(\'originalModel\',\'' + json.model + '\')">' + json.model + '</a><br/>';
	}

	if (hasValue(json.event)) {
		html += '<b>Event:</b> <a href="javascript:selectCategoryAndGroup(\'competitionEventID\',\'' + json.eventCode + '\')">' + json.event + '</a><br/>';
	}

	if (hasValue(json.carNumber)) {
		html += '<b>Car No.:</b> ' + json.carNumber + '<br/>';
	}

	if (hasValue(json.driver1)) {
		html += '<b>Driver:</b> <a href="javascript:selectCategoryAndGroup(\'competitionDriver1\',\'' + json.driver1 + '\')">' + json.driver1 + '</a><br/>';
	}

	if (hasValue(json.driver2)) {
		html += '<b>Co-Driver:</b> <a href="javascript:selectCategoryAndGroup(\'competitionDriver2\',\'' + json.driver2 + '\')">' + json.driver2 + '</a><br/>';
	}

	if (hasValue(json.competitionClass)) {
		html += '<b>Class:</b> <a href="javascript:selectCategoryAndGroup(\'competitionClass\',\'' + json.competitionClass + '\')">' + json.competitionClass + '</a><br/>';
	}

	if (json.images !== undefined && json.images.length > 0) {
		html += '<hr/>';
		html+='<center>';
		html += '<div id="images">';
		for (image = 0; image < json.images.length; image++) {
			html += '<a href="javascript:showFrontLayer(' + image + ')"><img class="detailsImage" border="0" src="' + item + '/images/' + json.images[image] + '_400.png" onclick="showFrontLayer(' + image + ')"></a>';
			_imageArray[image] = "" + item + "/images/" + json.images[image] + ".png";
		}

		html += '</div>';
		html += '<hr/>';
	}

	html += '</div>';
	document.getElementById("details").innerHTML = html;

	if (hasValue(json.notes)) {
		html = json.notes + '<br/>';
		document.getElementById("notes").innerHTML = html;
	} else {
		document.getElementById("notes").innerHTML = "";
	}
}

function hasValue(string) {
	return (string !== undefined && string != "");
}

function getItemList(category, groupIndex, itemIndex)
{
	var xhr=new XMLHttpRequest();
	xhr.open('GET', category + "/group_" + groupIndex + ".json", true);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			gotItemList(itemIndex, this.responseText);
		}
	};
	
	xhr.send();
}

function gotItemList(itemIndex, responseText)
{
	var json = JSON.parse(responseText),
		item = 0;

	_groupIDs = [];
	for (item = 0; item < json.items.length; item ++) {
		_groupIDs[item] = json.items[item].id;
	}

	if (itemIndex !== "") {
		selectItem(itemIndex);
	}
}

function selectCategoryAndGroup(category, groupName) {
	window.location.href = window.location.protocol + "//" + window.location.hostname + "/items.html?category=" + category + "&groupName=" + groupName;
}

function showFrontLayer(index) {
	document.getElementById('bg_mask').style.visibility = 'visible';
	document.getElementById('frontlayer').style.visibility = 'visible';
	_imageIndex = index;
	updateImageSrc();
}

function updateImageSrc() {
	document.getElementById('popupImage').src = _imageArray[_imageIndex];
}

function previousImage() {
	_imageIndex = (_imageIndex == 0) ? _imageArray.length - 1 : _imageIndex - 1;
	updateImageSrc();
}

function nextImage() {
	_imageIndex = (_imageIndex == _imageArray.length - 1) ? 0 : _imageIndex + 1;
	updateImageSrc();
}

function onClickImage() {
	document.getElementById('bg_mask').style.visibility = 'hidden';
	document.getElementById('frontlayer').style.visibility = 'hidden';
}

function onClickPreviousItemButton() {
	var currentItemIndex = _groupIDs.indexOf(parseInt(_currentItem));

	selectItem("" + _groupIDs[currentItemIndex == 0 ? _groupIDs.length - 1 : currentItemIndex - 1]);
}

function onClickNextItemButton() {
	var currentItemIndex = _groupIDs.indexOf(parseInt(_currentItem));

	selectItem("" + _groupIDs[currentItemIndex == (_groupIDs.length - 1) ? 0 : currentItemIndex + 1]);
}