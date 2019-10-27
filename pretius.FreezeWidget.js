$.widget('pretius.freezeWidget', {
  _create: function(){
    this.name = 'Freeze widget: ';
    this._super( this.options );
    
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'initialize widget');
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name, 'widget options', this.options);
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name, 'widget element', this.element);
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name, 'widget element', this.element.get(0));
    this.options ={
      freeze_type : this.options.plugin.action.attribute01,
      number_of_columns_to_freeze : this.options.plugin.action.attribute02,
      reportregion_id : this.element.attr('id')
    };

    this.pluginSettings = {
      backgroundcolor: this.element.css("background-color")
    };
    this._check_proper_ammount_of_columns();
    if(this.not_proper_column_value){
      return 0;
    }
    this._set_default_settings();
    //events on refresh of report
    this.element.bind('apexbeforerefresh', $.proxy( this.beforeReportRefresh, this ));
    this.element.bind('apexafterrefresh', $.proxy( this.afterReportRefresh, this ));

  },
  afterReportRefresh: function( pEvent ){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'afterReportRefresh', pEvent);
    // retrive report settings
    this._set_default_settings();
    //refresh scrolls
    window.scrollTo(0,window.scrollY+1);
    window.scrollTo(0,window.scrollY-1);

    this.scrollElement.scrollLeft(this.pluginSettings.scrollX_value+1);
    this.scrollElement.scrollLeft(this.pluginSettings.scrollX_value-1);
  },
  beforeReportRefresh: function( pEvent ){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'beforeReportRefresh');
    $(window).off('scroll.'+this.options.reportregion_id);
    this.pluginSettings.scrollX_value = this.scrollElement.scrollLeft();

  },  
  destroy: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'destroy');
  },
  _check_proper_ammount_of_columns: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_check_proper_ammount_of_columns');
    var max_column_amount = this.element.find('th').length;
    var tableWrap = this.element.find('.t-Report-tableWrap');

    if(this.options.number_of_columns_to_freeze == null){
      this.not_proper_column_value = false;
    }
    else if(this.options.number_of_columns_to_freeze > max_column_amount){

      apex.debug.message(apex.debug.LOG_LEVEL.WARNING,this.name,'Number of columns to freeze is larger than number of all raport columns');
      console.warn('Number of columns to freeze is larger than number of all raport columns');
      this.not_proper_column_value = true;
    }else if(this.options.number_of_columns_to_freeze < 0){
      apex.debug.message(apex.debug.LOG_LEVEL.WARNING,this.name,'Number of columns to freeze is less than 0');
      console.warn('Number of columns to freeze is larger than number of all raport columns');
      this.not_proper_column_value = true;
    }
    else if(tableWrap.find('th:nth-child('+this.options.number_of_columns_to_freeze+')').offset().left + tableWrap.find('th:nth-child('+this.options.number_of_columns_to_freeze+')').outerWidth() >tableWrap.outerWidth() + tableWrap.offset().left - 200){
      apex.debug.message(apex.debug.LOG_LEVEL.WARNING,this.name,'The width of freeze columns is to much to freeze report properly');
      console.warn('The width of freeze columns is to much to freeze report properly');
      this.not_proper_column_value = true;
    }
    else{
      this.not_proper_column_value = false;
    }
  },
  _destroy: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_destroy');
  },

  _setOption: function( pKey, pValue ) {
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_setOption',{'pKey': pKey,'pValue':pValue});
    if ( pKey === "value" ) {
      pValue = this._constrain( pValue );
    }
    this._super( pKey, pValue );
  },  

  options: function( pOptions ){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'options');
    this._super( pOptions );
  },

  _setOptions: function( pOptions ) {
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_setOptions');
    this._super( pOptions );
  },
  _set_default_settings: function(){
    this.new_raport = this.element.find('div[id*="catch"]')
    this.new_raport_table_wrapper = this.new_raport.find('.t-Report > .t-Report-wrap > .t-Report-tableWrap');
    this.new_raport_table = this.new_raport.find('.t-Report > .t-Report-wrap > .t-Report-tableWrap > table');
    this.report_divs = this._get_divs(this.options.number_of_columns_to_freeze);
  
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
        //set border color
    this.new_raport_table_wrapper.css({
          "border-collapse": "separate",
          "margin-right": "-1px",
          "border-color": this.report_tdivs.thead.find('.t-Report-report th:first').css('border-color'),
          "border-right-width":"1px",
          "border-right-style":"solid",
      });

  },
  _set_freeze_headers_div: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_set_freeze_headers_div');

    var $freeze_header_div = $('<div></div>').addClass('freeze_header_div')
      .css({"background-color" : this.pluginSettings.backgroundcolor,"z-index" : 3 });
    var $freeze_header_table = this.new_raport_table.clone(true);
    var number_of_columns_to_freeze = this.options.number_of_columns_to_freeze;
    $freeze_header_table.find('tbody').remove();
    $freeze_header_table.find('thead tr th').each(function(index) {
      if(index >= number_of_columns_to_freeze){
        $(this).remove();
      }
    });
    $freeze_header_div.append($freeze_header_table);
    return $freeze_header_div;
  },
  _set_freeze_div: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_set_freeze_div');
    var self = this;
    var $freeze_div  =  $('<div></div>')
                          .addClass('freeze_div')
                          .css({
                            "background-color" : self.pluginSettings.backgroundcolor,
                            "z-index" : 2 
                          });

    var $freeze_table = self.new_raport_table.clone(true);
    $freeze_table.find('thead').remove();
    $freeze_table.find('tbody tr').each(function(index,element){
      $(this).find('td').each(function(index,element){
        if(index >= self.options.number_of_columns_to_freeze){
          $(this).remove();
        }
      });
    });

    $freeze_div.append($freeze_table);
    return $freeze_div;
  },
  _set_headers_div: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_set_headers_div');
    var self = this,
      $header_div =  $('<div></div>');
    
    $header_div
      .addClass('header_div')
      .css({
        "background-color" : self.pluginSettings.backgroundcolor,
        "z-index" : 1
      });

    var $header_table =  self.new_raport_table.clone(true);
    $header_table.find('tbody').remove();
    $header_table.find('thead tr th').each(function(index) {
      if(index < self.options.number_of_columns_to_freeze){
        $(this).remove();
      }
    });
    $header_div.append($header_table);
    return $header_div;
  },
  _set_standard_div: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_set_standard_div');
    var self = this;
    var $standard_div = $('<div></div>').addClass('standard_div');
    var $standard_table = self.new_raport_table.clone(true);

    $standard_table.find('thead').remove();
    $standard_table.find('tbody tr').each(function(){
      $(this).find('td').each(function(index){
        if(index < self.options.number_of_columns_to_freeze){
          $(this).remove();  
        }
      });
    });
    $standard_div.append($standard_table);
    return $standard_div;

  },
  _get_divs: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_get_divs');
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
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_get_tdivs',this.new_raport.width());
    //creating containers for head and body
    var tdivs_json;
    var $thead_div = $('<div></div>')
      .addClass('thead_div')
      .css({"background-color" : this.pluginSettings.backgroundcolor});
   
    var $tbody_div = $('<div></div>').addClass('tbody_div');
        
    // append all divs to table container
    $thead_div.append(this.report_divs.freeze_header_div)
      .append(this.report_divs.header_div);
    $tbody_div.append(this.report_divs.freeze_div)
      .append(this.report_divs.standard_div);

    tdivs_json = {
      thead: $thead_div,
      tbody: $tbody_div
    }
    return tdivs_json;
  },
  _get_element_position:function(pElement){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_get_element_position',{'element':pElement});
    return pElement.css("position");
  },
  _set_cell_Widths: function(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_set_cell_Widths',{'number_of_columns_to_freeze':this.options.number_of_columns_to_freeze, 'width of catch div':this.new_raport.width(), 'width of freeze header div': this.report_divs.freeze_header_div});
    var self = this;
    self.new_raport_table_wrapper.children('table').find('th').each(function(th_index) {
      
      var outer_cell_width = $(this).outerWidth();
      self.new_raport_table_wrapper
        .find('.thead_div th')
        .eq(th_index)
        .css({"min-width": outer_cell_width,
              "max-width": outer_cell_width
            });
      if(th_index < self.options.number_of_columns_to_freeze){
        self.new_raport_table_wrapper.find(".tbody_div > .freeze_div > table tr").each(function(tr_index){
          $(this)
            .children()
            .filter(function(index){ return index == th_index;})
            .css({"min-width": outer_cell_width,
                  "max-width" : outer_cell_width
                });
        });
      }else{
        self.new_raport_table_wrapper.find(".tbody_div > .standard_div > table tr").each(function(tr_index){
          $(this)
            .children()
            .filter(function(index){ return index == (th_index - self.options.number_of_columns_to_freeze);})
            .css("min-width", outer_cell_width);
        });
      }
    });
    //set header div width
    self.report_divs.header_div.width(self.new_raport.width() - self.report_divs.freeze_header_div.width());
    self.report_divs.standard_div.width(self.new_raport.width() - self.report_divs.freeze_div.width());
  },
  _set_cell_Heights(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_set_cell_Heights');
    var self = this;

    //setting heights of header divs
    this.report_divs.freeze_header_div.height(self.new_raport_table_wrapper.children('table').find('thead tr').outerHeight());
    this.report_divs.header_div.height(self.new_raport_table_wrapper.children('table').find('thead tr').outerHeight());

    self.new_raport_table_wrapper.children('table').find('tbody tr').each(function(tr_index) {
     
      var outer_cell_height = $(this).outerHeight();
      self.report_divs.freeze_div
        .find('tbody tr')
        .eq(tr_index)
        .css({
          "min-height": outer_cell_height,
          "max-height": outer_cell_height,
          "height": outer_cell_height
      });
      self.report_divs.standard_div
        .find('tbody tr')
        .eq(tr_index)
        .css({
          "min-height": outer_cell_height,
          "max-height": outer_cell_height,
          "height": outer_cell_height
      });
      
    });
  },
  _find_overflow_element(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_find_overflow_element');
    var elem = this.report_divs.standard_div;
    var visible_scroll = this._getScrollParent(elem);
    visible_scroll.css('overflow-x','hidden');
    while (elem.outerWidth() > elem.parent().outerWidth()) {
      elem = elem.parent();
    }
    this.scrollElement = elem;
    
    elem.css('overflow-x', 'scroll');
    elem.width(this.new_raport.outerWidth()-this.report_divs.freeze_div.outerWidth());
  },
  _getScrollParent(node) {
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_getScrollParent');
    if (node == null) {
      return null;
    }
    if (node[0].scrollWidth > node[0].clientWidth) {
      return node;
    } else {
      return this._getScrollParent(node.parent());
    }
  },
  _add_scrolls(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_add_scrolls',{'freeze type':this.options.freeze_type});
    //add scroll events depending on declare freeze type
    if(this.options.freeze_type =='freeze_column'){
      this._scroll_x_header_axis();
    }else if(this.options.freeze_type =='freeze_header'){
      this._scroll_y_axis();
      this._scroll_x_header_axis();
      this._set_border_table_wrap();
    }else if(this.options.freeze_type =='freeze_both'){
      this._scroll_x_header_axis();
      this._scroll_y_axis();

    }
  },
  _set_border_table_wrap(){
    this.new_raport_table_wrapper.css({
      "border-collapse": "separate",
      "border-color": this.report_tdivs.thead.find('.t-Report-report th:first').css('border-color'),
      "border-left-width":"1px",
      "border-left-style":"solid",
      "margin-left": "-1px"
  });
  },
  _scroll_x_header_axis(){
    
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_scroll_x_header_axis');
    
      this.scrollElement.scroll($.proxy(function (event) {
        apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_scroll_x_header_axis scroll event',{'event':event});
        if(this.report_tdivs.thead.css("position") === "fixed"){
          this.report_divs.header_div.css("left", - this.scrollElement.scrollLeft());
          this.report_divs.freeze_header_div.css("left",0);

        }else if(this.report_tdivs.thead.css("position") === "relative"){
          this.report_divs.header_div.css("left",- this.scrollElement.scrollLeft());
        }
      },this)
    );

  },
  _scroll_y_axis(){
    apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_scroll_y_axis');

    var header_offset_top_fixed = this.new_raport.find('.t-Report-tableWrap').offset().top;
    var tableWrap_height = this.new_raport.find('.t-Report-tableWrap').height();
    var header_offset_top_relative = this.report_tdivs.thead.offset().top;
    var thead_height = this.report_tdivs.thead.height();
    var event_scroll_selector = this.options.reportregion_id;
    this.theadPosition = "relative";

    $(window).on('scroll.'+event_scroll_selector, $.proxy(function(event){
      apex.debug.message(apex.debug.LOG_LEVEL.INFO,this.name,'_scroll_y_axis scroll event',{'event':event});
      var page_header_height = $('.t-Header').height();

      if(this.theadPosition === "fixed"){
        if($(window).scrollTop() < header_offset_top_fixed || $(window).scrollTop() +thead_height > header_offset_top_fixed + tableWrap_height){
          var actualScroll = this.scrollElement.scrollLeft();
          this.pluginSettings.scrollX_value = actualScroll;
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

          this.scrollElement.scrollLeft(this.pluginSettings.scrollX_value+1);
          this.scrollElement.scrollLeft(this.pluginSettings.scrollX_value-1);
          
        }else{
          
          this.report_tdivs.thead.css("position", "fixed");
          this.theadPosition = "fixed";   
        };
      }else if(this.theadPosition === "relative"){
        
        if($(window).scrollTop() >header_offset_top_relative && $(window).scrollTop() + thead_height < header_offset_top_relative + tableWrap_height){
          var actualScroll = this.scrollElement.scrollLeft();
          this.pluginSettings.scrollX_value = actualScroll;
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
          this.scrollElement.scrollLeft(this.pluginSettings.scrollX_value+1);
          this.scrollElement.scrollLeft(this.pluginSettings.scrollX_value-1);
        }else{
          this.theadPosition = "relative";
          this.report_tdivs.thead.css("position", "relative");
          this.report_divs.freeze_header_div.css("top",0);
          this.report_divs.header_div.css("top",0);     
        }         
      }

    },this));
  }
});

