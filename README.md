# Pretius Extend Classic Report

Pretius Extend Classic Report is dynamic action plugin for freezing columns and header of classic report in Oracle Application Express(APEX).

## Information about plugin

In many situations, Classic Reports have multiple columns and users want to have a key column visible all the time even if horizontal scroll appeared. The best solution for this problem is to freeze these key columns to make them all the time visible. In classic report this kind of option is not available. The same happens with headers if the vertical scroll appeared it is very useful to have freeze header stick to the top of browser window. For these particular cases The Pretius Extend Classic Report was created.

## Preview

![Preview gif](images/pretius_apex_extend_classic_report_gif.gif)


## License

MIT

## Feature at glance
* compatible with Oracle APEX 5.1, 18.x, 19.x
* freeze column in classic report
* freeze headers in classic report
* freezing also works in modal dialog pages

## Roadmap
* [ ] Floating scrollbar

## Installation

### Install procedure
Using Oracle APEX plugin wizard install the plugin file dynamic_action_plugin_pretius_extend_classic_report.sql

## Demo application

https://apex.oracle.com/pls/apex/f?p=PRETIUS_EXTEND_CLASSIC_REPORT:100

## Usage guide

1. Create dynamic action _After Refresh_ for indicated report 
1. Configure the plugin options
  1. Freeze type - decide if you want freeze columns, headers or both
  1. Columns to freeze - number of columns to freeze
1. Set _Fire on Initialization_ to __YES__
1. Lunch application

## Changelog

### 1.0.0 
Initial Release

## Known issues

 
## About Author
Author | Github | Twitter | E-mail
-------|-------|---------|-------
Bartosz Sypuła | [@sypulabartosz](https://github.com/sypulabartosz) | [@sypulabartosz](https://twitter.com/sypulabartosz) | bsypula@pretius.com

Thanks to [@bostrowski](https://github.com/bostrowski) for pro tips, which I received and help in creation of the plugin
## About Pretius
Pretius Sp. z o.o. Sp. K.

Address | Website | E-mail
--------|---------|-------
Żwirki i Wigury 16A, 02-092 Warsaw, Poland | [http://www.pretius.com](http://www.pretius.com) | [office@pretius.com](mailto:office@pretius.com)

## Support
Our plugins are free to use but in some cases you might need to contact us. We are willing to assist you but in certain circumstances you will be charged for our time spent on helping you. Please keep in mind we do our best to keep documentation up to date and we won't answer question for which there is explaination in documentation (at github and as help text in application builder).

All request (bug fix / change request) should be posted in Issues Tab at github repository.

### Free support
We do support the plugin in certain cases such as bug fixing and change request. If you have faced issue that might be bug please check Issues tab in github repository. In case you won't be able to find related issue please raise the issue following these rules:

* issue should contain login credentials to application at apex.oracle.com where issue is reproduced
* issue should contain steps to reproduce the issue in demo application
* issue should contain description about it's nature

### Paid support
In case you are not able to implement the plugin or you are willing to have custom implementation based on the plugin attributes (ie. custom JavaScript callbacks) we are willing to help you. Please send inquiry to <email> with description what you want us to help you with. We will contact you as soon as possible with pricing and possible dates.
