de
==========

Jade template mixins for use with the Gumby web framework.

# Installing

Copy the gumby directory to your **express** application views directory.

# Including the templates you need.

Add these lines for the mixins you want in your template.

    include gumby/grid.jade
    include gumby/buttons.jade
    include gumby/indicators.jade

# Call the mixin in your jade template.

You can call a mixin by typing `+row`.

# Grid Mixins - gumby/grid.jade

## row
The `+row` mixin is used to create a grid row.

Example 1:

     +row
       p This is in a row.

## columns
The `+columns` mixin is used to create a sized column.

Example:
    +row
      +columns.two
        p two
      +columns.four
        p Four
      
## colgrid

## tiles

