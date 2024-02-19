Feature: Order to Invoice

Scenario: Successflly create Invoice from from Sale Order
  Given I am logged in as an "admin"
  And I am on Orders to Invoice page
  When I click on Order to Invoice with name "S00007"
  And I create invoice with "Regular invoice" option set
  And I send the invoice
  And I register payment
  Then Invoice should have "Posted" as active state
  #And Debit and credit amounts should add up
  And Invoice should be created