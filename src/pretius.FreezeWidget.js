"use strict";
$.widget('pretius.freezeWidget', {
  

  C_PLUGIN_NAME      : 'Pretius APEX Extend Classic Report',
  C_LOG_PREFIX       : 'Extend Classic Report: ',
  C_LOG_LVL_ERROR    : apex.debug.LOG_LEVEL.ERROR,         // value 1 (end-user)  
  C_LOG_LVL_WARNING  : apex.debug.LOG_LEVEL.WARN,          // value 2 (developer)
  C_LOG_LVL_DEBUG    : apex.debug.LOG_LEVEL.INFO,          // value 4 (debug)
  C_LOG_LVL_6        : apex.debug.LOG_LEVEL.APP_TRACE,     // value 6 
  C_LOG_LVL_9        : apex.debug.LOG_LEVEL.ENGINE_TRACE,  // value 9

  _create: function(){
    this._super( this.options );
    
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'initialize widget');
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME, 'widget options', this.options);
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME, 'widget element', this.element);

    this.new_raport = this.element.find('div[id*="catch"]');
    this.options ={
      freeze_columns : this.options.plugin.action.attribute01 ? this.options.plugin.action.attribute01.indexOf('freeze_column') > -1 : false,
      freeze_header : this.options.plugin.action.attribute01 ? this.options.plugin.action.attribute01.indexOf('freeze_header') > -1 : false,
      number_of_columns_to_freeze : (this.options.plugin.action.attribute01 ? this.options.plugin.action.attribute01.indexOf('freeze_column') > -1 : false) ? this.options.plugin.action.attribute02 : 0,
      reportregion_id : this.element.attr('id'),
      max_column_amount : this.element.find('.t-Report-tableWrap tbody tr:first td').length,
      error_message : {
        not_proper_col_amount : '[ ' + this.element.attr('id') +' ]' + "The plugin was stopped because of not proper amount of columns.",
        to_much_freeze_col : '[ ' + this.element.attr('id') +' ]' + "Number of columns to freeze is larger than number of all raport columns",
        freeze_col_smaler_than_0 : '[ ' + this.element.attr('id') +' ]' + "Number of columns to freeze is less than 0."
      }
    };
    this.plugin_settings = {
      backgroundcolor: this.element.css("background-color"),
      IsModal : $(".t-Dialog-bodyWrapperIn").is(":visible") ? 1: 0,
      scrollYSelector : $(".t-Dialog-bodyWrapperIn").is(":visible") ? $(".t-Dialog-bodyWrapperIn"): $(document)
    };
    // check restrictions for freezeing columns
    if(this.options.freeze_columns){
      this._check_proper_ammount_of_columns();
    }
    if(this.not_proper_column_value){
      return 0;
    }else{

    this._set_default_settings();
    //events on refresh of report
    this.element.bind('apexbeforerefresh', $.proxy( this.before_report_refresh, this ));
    this.element.bind('apexafterrefresh', $.proxy( this.after_report_refresh, this ));
    // events on apexwindowresized
    $(window).bind('apexwindowresized', $.proxy( this.window_resize_report, this ));
    this.add_resize_observer();

    }
  },
  after_report_refresh: function( pEvent ){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'after_report_refresh', pEvent);
    // retrive report settings
    this._set_default_settings();
    //refresh scrolls
    this.plugin_settings.scrollYSelector.scrollTop(this.plugin_settings.scrollYSelector.scrollTop()+1);
    this.plugin_settings.scrollYSelector.scrollTop(this.plugin_settings.scrollYSelector.scrollTop()-1);
    this.scrollElement.scrollLeft(this.plugin_settings.scrollX_value+1);
    this.scrollElement.scrollLeft(this.plugin_settings.scrollX_value-1);
  },
  before_report_refresh: function( pEvent ){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'before_report_refresh');
    this.plugin_settings.scrollYSelector.off('scroll.'+this.options.reportregion_id);
    this.plugin_settings.scrollX_value = this.scrollElement.scrollLeft();
  },
  add_resize_observer: function( ){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'add_resize_observer');
    let widget = this;
    const myObserver = new ResizeObserver(function(entries) {
      entries.forEach(function(entry) {
        widget._set_cell_Heights();
        widget._set_cell_Widths();
      });
    });

    myObserver.observe(this.element[0]);

  }, 
  window_resize_report: function( pEvent ){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'window_resize_report', pEvent);
    
    this._set_cell_Heights();
    this._set_cell_Widths();

  }, 
  destroy: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'destroy');
  },
  _check_proper_ammount_of_columns: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_check_proper_ammount_of_columns',{'columns to freeze': this.options.number_of_columns_to_freeze,'max columns':this.options.max_column_amount});
    var table_wrap = this.element.find('.t-Report-tableWrap');
    
    if(this.options.number_of_columns_to_freeze == null){
      this.not_proper_column_value = false;
    }
    else if(this.options.number_of_columns_to_freeze > this.options.max_column_amount){
      apex.debug.message(this.C_LOG_LVL_ERROR,this.C_PLUGIN_NAME,'Number of columns to freeze is larger than number of all raport columns');
      this._show_error_page_message(this.options.error_message.to_much_freeze_col);
      this.not_proper_column_value = true;
    }else if(this.options.number_of_columns_to_freeze < 0){
      apex.debug.message(this.C_LOG_LVL_ERROR,this.C_PLUGIN_NAME,'Number of columns to freeze is less than 0');

      this._show_error_page_message(this.options.error_message.freeze_col_smaler_than_0);
      this.not_proper_column_value = true;
    }
    else if(table_wrap.find('tbody tr:first td:nth-child('+this.options.number_of_columns_to_freeze+')').offset().left + table_wrap.find('tbody tr:first td:nth-child('+this.options.number_of_columns_to_freeze+')').outerWidth() >this.new_raport.outerWidth() + this.new_raport.offset().left){
      apex.debug.message(this.C_LOG_LVL_ERROR,this.C_PLUGIN_NAME,'The width of freeze columns is to much to freeze report properly');
      this._show_error_page_message(this.options.error_message.not_proper_col_amount);
      this.not_proper_column_value = true;
    }
    else{
      this.not_proper_column_value = false;
    }
  },
  _destroy: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_destroy');
  },

  _setOption: function( p_key, p_value ) {
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_setOption',{'p_key': p_key,'p_value':p_value});
    if ( p_key === "value" ) {
      p_value = this._constrain( p_value );
    }
    this._super( p_key, p_value );
  },
  options: function( p_options ){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'options');
    this._super( p_options );
  },

  _setOptions: function( p_options ) {
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_setOptions');
    this._super( p_options );
  },
  _show_error_page_message: function (p_message) { 
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_show_error_page_message');
    //apex.message.clearErrors();
    apex.message.showErrors([
      {
        type:       "error",
        location:   "page",
        message:    p_message,
        unsafe:     false
      }
    ]);
  },
  _set_default_settings: function(){
    this.new_raport = this.element.find('div[id*="catch"]')
    this.new_raport_table_wrapper = this.new_raport.find('.t-Report > .t-Report-wrap > .t-Report-tableWrap');
    this.new_raport_table = this.new_raport.find('.t-Report > .t-Report-wrap > .t-Report-tableWrap > table');
    this.report_divs = this._get_divs();
  
    this.report_tdivs = this._get_tdivs();
    //setting heights of rows
    this._set_cell_Heights();
    //apending thead and tbody ivs
    this.new_raport_table_wrapper
      .append(this.report_tdivs.thead)
      .append(this.report_tdivs.tbody);
    // setting cell widths
    this._set_cell_Widths();
    // finding and setting overflow
    this._find_overflow_element();
    this.new_raport_table.remove();
    //adding scrolls events
    this._add_scrolls();

  },
  _set_freeze_headers_div: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_set_freeze_headers_div');

    var freeze_header_div = $('<div></div>').addClass('freeze_header_div')
      .css({"background-color" : this.plugin_settings.backgroundcolor,"z-index" : 3 });
    var $freeze_header_table = this.new_raport_table.clone(true);
    var number_of_columns_to_freeze = this.options.number_of_columns_to_freeze;
    $freeze_header_table.find('tbody').remove();
    $freeze_header_table.find('thead tr th').each(function(index) {
      if(index >= number_of_columns_to_freeze){
        $(this).remove();
      }
    });
    freeze_header_div.append($freeze_header_table);
    return freeze_header_div;
  },
  _set_freeze_div: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_set_freeze_div');
    var freeze_div  =  
      $('<div></div>')
        .addClass('freeze_div')
        .css({
          "background-color" : this.plugin_settings.backgroundcolor,
          "z-index" : 2 
        });

    var freeze_table = this.new_raport_table.clone(true);
    freeze_table.find('thead').remove();
    $.each(freeze_table.find('tbody tr'), $.proxy(function(index, elem) {
      $.each($(elem).find('td'), $.proxy(function(index, elem) {
        if(index >= this.options.number_of_columns_to_freeze){
          $(elem).remove();
        } 
      }, this) );
    }, this) );

    freeze_div.append(freeze_table);
    return freeze_div;
  },
  _set_headers_div: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_set_headers_div');
    var header_div =  $('<div></div>');
    header_div
      .addClass('header_div')
      .css({
        "background-color" : this.plugin_settings.backgroundcolor,
        "z-index" : 1
      });
    var header_table =  this.new_raport_table.clone(true);
    header_table.find('tbody').remove();
    
    $.each(header_table.find('thead tr th'), $.proxy(function(index, elem) {
      if(index < this.options.number_of_columns_to_freeze){
        $(elem).remove();
      } 
    }, this) );

    header_div.append(header_table);
    return header_div;
  },

  _set_standard_div: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_set_standard_div');
    var standard_div = $('<div></div>').addClass('standard_div');
    var standard_table = this.new_raport_table.clone(true);

    standard_table.find('thead').remove();

    $.each(standard_table.find('tbody tr'), $.proxy(function(index, elem) {
      $.each($(elem).find('td'), $.proxy(function(index, elem) {
        if(index < this.options.number_of_columns_to_freeze){
          $(elem).remove();  
        }
      }, this) );
    }, this) );

    standard_div.append(standard_table);
    return standard_div;

  },
  _get_divs: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_get_divs');
    //division on four divs
    var widget_divs_json;

    widget_divs_json = {
      freeze_header_div: this._set_freeze_headers_div(),
      header_div: this._set_headers_div(),
      freeze_div: this._set_freeze_div(),
      standard_div: this._set_standard_div()
    }
    return widget_divs_json;
  },
  _get_tdivs: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_get_tdivs',this.new_raport.width());
    //creating containers for head and body
    var tdivs_json;
    var thead_div = $('<div></div>')
      .addClass('thead_div')
      .css({"background-color" : this.plugin_settings.backgroundcolor});
   
    var tbody_div = $('<div></div>').addClass('tbody_div');
        
    // append all divs to table container
    thead_div.append(this.report_divs.freeze_header_div)
      .append(this.report_divs.header_div);
    tbody_div.append(this.report_divs.freeze_div)
      .append(this.report_divs.standard_div);

    tdivs_json = {
      thead: thead_div,
      tbody: tbody_div
    }
    return tdivs_json;
  },
  _set_cell_Widths: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_set_cell_Widths',{'number_of_columns_to_freeze':this.options.number_of_columns_to_freeze, 'width of catch div':this.new_raport.width(), 'width of freeze header div': this.report_divs.freeze_header_div});

    $.each(this.new_raport_table_wrapper.children('table').find('th'), $.proxy(function(th_index, elem) {
      
      var outer_cell_width = $(elem).outerWidth();
      this.new_raport_table_wrapper
        .find('.thead_div th')
        .eq(th_index)
        .css({"min-width": outer_cell_width
             ,"max-width": outer_cell_width
            });
      if(th_index < this.options.number_of_columns_to_freeze){
        $.each(this.new_raport_table_wrapper.find(".tbody_div > .freeze_div > table tr"), $.proxy(function(tr_index, elem) {
          $(elem)
            .children()
            .filter(function(index){ return index == th_index;})
            .css({"min-width": outer_cell_width,
                  "max-width" : outer_cell_width
            });          
        }, this) );
      }else{
        $.each(this.new_raport_table_wrapper.find(".tbody_div > .standard_div > table tr"), $.proxy(function(tr_index, elem) {
          $(elem)
            .children()
            .filter( $.proxy(function(index) {
              return index == (th_index - this.options.number_of_columns_to_freeze);
            }, this))
            .css({"min-width": outer_cell_width,
            "max-width" : outer_cell_width
      }
            );          
        }, this) );
      }      
    }, this) );

    //this.report_divs.header_div.width(this.new_raport.width() - this.report_divs.freeze_header_div.width());
    this.report_divs.standard_div.width(this.new_raport.width() - this.report_divs.freeze_div.width());

    if(this.report_divs.standard_div.width()> this.report_divs.standard_div.find('.t-Report-report').width()){
      this.report_divs.header_div.width(this.report_divs.standard_div.find('.t-Report-report').width());
      this.new_raport_table_wrapper.find('.standard_div tr td:last-child').css('border-right','');
      this.new_raport_table_wrapper.find('.header_div tr th:last-child').css('border-right','');
    }else{
      this.report_divs.header_div.width(this.new_raport.width() - this.report_divs.freeze_header_div.width());
      this.new_raport_table_wrapper.find('.standard_div tr td:last-child').css('border-right','none');
      this.new_raport_table_wrapper.find('.header_div tr th:last-child').css('border-right','none');
    }
    
    //this.report_divs.header_div.width(this.report_divs.standard_div.width());

  },
  _set_cell_Heights: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_set_cell_Heights');
    //setting heights of header divs
    this.report_divs.freeze_header_div.height(this.new_raport_table_wrapper.children('table').find('thead tr').outerHeight());
    this.report_divs.header_div.height(this.new_raport_table_wrapper.children('table').find('thead tr').outerHeight());

    $.each(this.new_raport_table_wrapper.children('table').find('tbody tr'), $.proxy(function(tr_index, elem) {
      var outer_cell_height = $(elem).outerHeight();
      this.report_divs.freeze_div
        .find('tbody tr')
        .eq(tr_index)
        .css({
          "min-height": outer_cell_height,
          "max-height": outer_cell_height,
          "height": outer_cell_height
      });
      this.report_divs.standard_div
        .find('tbody tr')
        .eq(tr_index)
        .css({
          "min-height": outer_cell_height,
          "max-height": outer_cell_height,
          "height": outer_cell_height
      });      
    }, this) );

  },
  _delete_last_modify_borders: function(){
    //removing the redundant barrier
    this.new_raport_table_wrapper.css({
      "border-collapse": "separate",
      "margin-right": "-1px",
      "border-color": this.element.css('border-color'),
      "border-right-width":"1px",
      "border-right-style":"solid",
    });
    this.new_raport_table_wrapper.find('.standard_div tr td:last-child').css('border-right','none');
    this.new_raport_table_wrapper.find('.standard_div tr td:first-child').css('border-left','none');
    this.new_raport_table_wrapper.find('.header_div tr th:last-child').css('border-right','none');
    this.new_raport_table_wrapper.find('.header_div tr th:first-child').css('border-left','none');
  },
  _find_overflow_element: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_find_overflow_element');
    var elem = this.report_divs.standard_div;
    var visible_scroll = this._getScrollParent(elem);
    visible_scroll.css('overflow-x','hidden');
    while (elem.outerWidth() > elem.parent().outerWidth()) {
      elem = elem.parent();
    }
    this.scrollElement = elem;
    elem.css('overflow-x', 'scroll');
  },
  _getScrollParent: function(pnode) {
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_getScrollParent');
    if (pnode == null) {
      return null;
    }
    if (pnode[0].scrollWidth > pnode[0].clientWidth) {
      return pnode;
    } else {
      return this._getScrollParent(pnode.parent());
    }
  },
  _add_scrolls: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'f',{'freeze_columns type':this.options.freeze_columns, 'freeze_header type':this.options.freeze_header});
    //add scroll events depending on declare freeze type
    // freeze only columns
    if(this.options.freeze_columns && !this.options.freeze_header){
      this._scroll_x_header_axis();
      this._delete_last_modify_borders();
    // freeze only header
    }else if(!this.options.freeze_columns && this.options.freeze_header){
      this._scroll_y_axis();
      this._scroll_x_header_axis();
      this._set_border_table_wrap();
      this._delete_last_modify_borders();
    // freeze both columns and header
    }else if(this.options.freeze_columns && this.options.freeze_header){
      this._scroll_x_header_axis();
      this._scroll_y_axis();
      this._delete_last_modify_borders();
    }
  },
  _set_border_table_wrap: function(){
    this.new_raport_table_wrapper.css({
      "border-collapse": "separate",
      "border-color": this.report_tdivs.thead.find('.t-Report-report th:first').css('border-color'),
      "border-left-width":"1px",
      "border-left-style":"solid",
      "margin-left": "-1px"
  });
  },
  _scroll_x_header_axis: function(){
    
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_scroll_x_header_axis');
    
      this.scrollElement.scroll($.proxy(function (event) {
        apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_scroll_x_header_axis scroll event',{'event':event});
        if(this.report_tdivs.thead.css("position") === "fixed"){
          this.report_divs.header_div.css("left", - this.scrollElement.scrollLeft());
          this.report_divs.freeze_header_div.css("left",0);

        }else if(this.report_tdivs.thead.css("position") === "relative"){
          this.report_divs.header_div.css("left",- this.scrollElement.scrollLeft());
        }
      },this)
    );

  },
  _scroll_y_axis: function(){
    apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_scroll_y_axis',this.plugin_settings);

    var header_offset_top_fixed = this.plugin_settings.IsModal == 1 ? this.new_raport.find('.t-Report-tableWrap').offset().top + this.plugin_settings.scrollYSelector.scrollTop() : this.new_raport.find('.t-Report-tableWrap').offset().top,
      tableWrap_height = this.new_raport.find('.t-Report-tableWrap').height(),
      header_offset_top_relative = this.plugin_settings.IsModal == 1 ? this.report_tdivs.thead.offset().top + this.plugin_settings.scrollYSelector.scrollTop() : this.report_tdivs.thead.offset().top,
      thead_height = this.report_tdivs.thead.height(),
      event_scroll_selector = this.options.reportregion_id;
    this.theadPosition = "relative";


    this.plugin_settings.scrollYSelector.on('scroll.'+event_scroll_selector, $.proxy(function(event){
      apex.debug.message(this.C_LOG_LVL_DEBUG,this.C_PLUGIN_NAME,'_scroll_y_axis scroll event',{'event':event});
      var header_height = $('.t-Header').height() ? $('.t-Header').height() : 0,
      body_title_height = $('.t-Body-title').height() ? $('.t-Body-title').height() : 0,
      page_header_height = body_title_height + header_height;

      if(this.theadPosition === "fixed"){
        
        if(this.plugin_settings.scrollYSelector.scrollTop() + page_header_height< header_offset_top_fixed || this.plugin_settings.scrollYSelector.scrollTop() + page_header_height> header_offset_top_fixed + tableWrap_height - thead_height){
      
          this.report_divs.freeze_header_div.css("left",0);
          this.report_divs.header_div.css("left", 0);
          this.theadPosition = "relative";
          this.report_tdivs.thead.css("position", "relative");
          this.report_divs.freeze_header_div.css("top",0);
          this.report_divs.header_div.css("top",0);
          this.report_tdivs.thead.css("top",0)
          this.report_tdivs.tbody.css('padding-top',0);
          this.report_tdivs.thead.css('width','');
          this.report_tdivs.thead.css({
            "border-bottom-color": "", 
            "border-bottom-width":"",
            "border-bottom-style":""
          });
          //actualizing scroll
          this.report_divs.header_div.css("left",- this.scrollElement.scrollLeft());      
        }else{
          if(header_offset_top_relative != page_header_height){
            this.report_tdivs.thead.css("top",page_header_height);
          }
        }
      }else if(this.theadPosition === "relative"){
        
        if(this.plugin_settings.scrollYSelector.scrollTop() + page_header_height > header_offset_top_relative && this.plugin_settings.scrollYSelector.scrollTop() + page_header_height < header_offset_top_relative + tableWrap_height - thead_height){

          this.report_tdivs.thead.css("position", "fixed");
          this.theadPosition = "fixed";
          this.report_divs.freeze_header_div.css("left", 0);
          this.report_tdivs.tbody.css('padding-top',  this.report_divs.header_div.height());  
          this.report_tdivs.thead.css("top",page_header_height);
          this.report_tdivs.thead.css({
            "border-bottom-color": this.report_tdivs.thead.find('.t-Report-report th:first').css('border-color'), 
            "border-bottom-width":"1px",
            "border-bottom-style":"solid"
          });
          //actualizing scroll
          this.report_divs.header_div.css("left", - this.scrollElement.scrollLeft());
          this.report_divs.freeze_header_div.css("left",0);
        }      
      }

    },this));
  }
});