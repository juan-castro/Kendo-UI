// Trigger Kendo Grid
function triggerKendoTable(){

	$.getJSON("json/doc-repo-REC.json", function(data){

		//Count for variable on row IDs.
		var count = 1;

		//Render table
		$("#docRepoTable").kendoGrid({
			dataSource: {
				data: data,
				pageSize: 10,
				sort: { 
					field: "CreatedDate", 
					dir: "desc"
				}
			},
			sortable: true,
			scrollable: false,
			pageable: {
				refresh: false,
				messages: {
					    display: "{0} - {1} of {2}",
						empty: "No items",
						page: "Page",
						of: "of {0}",
						itemsPerPage: "ENTRIES",
						first: "FIRST",
						previous: "PREV",
						next: "NEXT",
						last: " LAST",
						refresh: "Refresh"
					}
			},
			columns: [{
				template: "# if (isNaN(count)) {count=0;} else {count++;}#<input type='checkbox' class='checkbox' id='check-#= count#' data-bind='checked: Selected' #= Selected ? checked='checked' : '' #><label for='check-#=count++#'></label>",
				title: "<input type='checkbox' class='checkbox' id='checkAll'><label for='checkAll'></label>",
				sortable: false,
				width: 62
			},{
				field: "ReferenceNumber",
				template: "<span>#=ReferenceNumber#</span>",
				title: "<span>Document Reference</span>",
				sortable: true
			},{
				field: "DocumentName",
				template: "<div class='table-type #=CategoryCode#'>#=CategoryCode#</div><span>#=DocumentName#</span> ",
				title: "Name",
				sortable: true
			},{
				field: "CreatedDate",
				template: "<span>#=CreatedDate#</span>",
				title: "Date Added",
				width: 141,
				sortable: true,
			}]
		});

		computeMixedFilters();
		listViewDataBound();
		$('.pagContainerTop > a.k-link:eq(1), .pagContainerTop > a.k-link:eq(2)').addClass('btn');
	});
};

//Determine what the search input is and use spaces as ANDS
function computeSearchInput(){
	var searchValue = $("#search-input").val().trim().split(" ");
	var createdFilter = [], tempFilter = {};
	for (var i = 0; i < searchValue.length; i++){
		tempFilter = {
			logic: "or",
			filters: [{
				field: "ReferenceNumber",
				value: searchValue[i],
				operator: "contains"
			},{
				field: "DocumentName",
				value: searchValue[i],
				operator: "contains"
			},{
				field: "CategoryCode",
				value: searchValue[i],
				operator: "contains"
			},{
				field: "CreatedDate",
				value: searchValue[i],
				operator: "contains"
			}]
		}
		createdFilter.push(tempFilter);
	}
	return {
		logic: "and",
		filters: createdFilter
	};
}

function computeMixedFilters() {
	var dataSource = $("#docRepoTable").data("kendoGrid").dataSource,
		search = computeSearchInput(),
		searchTerm = $("#search-input").val().trim().split(" ");
	//Determines the format of the filter to be passed into the dataSource
	dataSource.filter(search);
	if (searchTerm.length > 0 && searchTerm[0] != ""){
		for (var i = 0; i < searchTerm.length; i++){
			$('#docRepoTable td').highlight(searchTerm[i]);
		}
		$('.icon-search').fadeOut(10);
		$('.icon-close').fadeIn(10);	
	} else {
		$('.icon-close').fadeOut(10);
		$('.icon-search').fadeIn(10);
	}
}

// Clear search function
function clearSearch() {
	$("#search-input").prop('value','');
	computeMixedFilters();
}

// Resize sidebar to take 100% of window height
function resizeSidebar() {
	var windowHeight = $(window).innerHeight(),
	leftColHeight = $('.left-colum').height(),
	leftcolOffset = $('.left-colum').offset().top,
	bottomSpace = windowHeight - leftcolOffset - leftColHeight;

	$('.left-colum').css('paddingBottom', bottomSpace);
}

// Add additional pagination at the top of the table
function listViewDataBound() {
	var listView = $('#docRepoTable').data('kendoGrid');
    var pager = $('div .k-pager-wrap');
    pager.addClass("pagerBottom");
    var id = pager.attr('data-role') + '_top';
    if (listView.topPager === (null || undefined)) {
        var topPager = $('<div id="' + id + '" class=k-pager-wrap pager" />').appendTo('#pagination');
        listView.topPager = new kendo.ui.Pager(topPager, $.extend({}, listView.options.pageable, { dataSource: listView.dataSource }));
        listView.options.pagerId = id; // cloning the pageable options will use the id from the bottom pager
        listView.topPager.refresh(); // DataSource change event is not fired, so call this manually
        $('#' + id).find(".k-pager-info").insertBefore($('#' + id).children().first());
        $('#' + id).children().next().wrapAll("<div class='pagContainerTop'></div>");
    }
}

// Custom function to allow toggling functions on one link
$.fn.clickToggle = function(func1, func2) {
    var funcs = [func1, func2];
    this.data('toggleclicked', 0);
    this.click(function() {
        var data = $(this).data();
        var tc = data.toggleclicked;
        $.proxy(funcs[tc], this)();
        data.toggleclicked = (tc + 1) % 2;
    });
    return this;
};

// Check if Side Nav is open
var sideNavOpen = false;

// Open Side Nav
function openSideNav() {
	$('.sidebar-nav, .sidebar-nav li').animate({ width: 272}, 150, 'swing');
	rotateAnimation(0, 90);
	sideNavOpen = true;
}

// Close Side Nav
function closeSideNav() {
	$('.sidebar-nav, .sidebar-nav li').animate({ width: 57}, 150, 'swing');
	rotateAnimation(90, 0);
	sideNavOpen = false;
}

// Rotate Side Nav trigger button
function rotateAnimation(start, end) {
    var $elem = $('.trigger');
    $({deg: start}).animate({deg: end}, {
        duration: 50,
        step: function(now) {
            $elem.css({
                transform: 'rotate(' + now + 'deg)'
            });
        }
    });
}

$(function() {

	triggerKendoTable();

	// Highlight text on table search
	$("#search-input").on('keyup', function(){
		computeMixedFilters();
	});

	// Clear search when user clicks 'X'
	$('#clear-search').on('click', clearSearch);

	// Set count array for DropDownList
	var count = [
        { text: "10", value: 10 },
        { text: "20", value: 20 },
        { text: "60", value: 60},
        { text: "All", value: 100000 }
    ];

	// create DropDownList from input HTML element
	$("#count").kendoDropDownList({
		dataTextField: "text",
		dataValueField: "value",
		dataSource: count,
		index: 0,
		change: onChange
	});


	// Redraw the table on DropDownList selection   
	function onChange(selector) {
		var value = 10,
			grid = $("#docRepoTable").data("kendoGrid"),
			value = $("#count").val();
			$("#count").data("kendoDropDownList").value(value);
		grid.dataSource.pageSize(value);
		grid.refresh();
		computeMixedFilters();
	}

	// Select all checkboxes when you click 'Select All' button
	$(document).on('click', '#checkAll', function () {
	    var table = $(this).closest('table');
	    table.find('input:checkbox').not('#checkAll').prop('checked',this.checked);
	});

	resizeSidebar(); 

	$(window).resize(function(){
        resizeSidebar();
    });

	// Open/Close Side Nav on click
	$('.nav-trigger').clickToggle(openSideNav, closeSideNav);
	
	// Show Side Nav links on hover
	$('.sidebar-nav li').hover(
		function() {
			if (!sideNavOpen) 
				$(this).stop().animate({ width: 272}, 150, 'swing');
		}, function() {	
			if (!sideNavOpen) 
				$(this).stop().animate({ width: 57}, 150, 'swing');
		}
	);

	// Show tools dropdown menu
	$('#tools, #tools-menu').on("click", function(event){
		event.stopPropagation();
		var menu = $('#tools-menu');
		if (menu.is(':visible')){
			menu.addClass('hidden');
		} else {
			menu.removeClass("hidden");
		}
	});

	// Hide tools dropdown menu when you click on the document
	$(document).on('click', function(e){
		$('#tools-menu').addClass("hidden");
	});

});










