Feature: Quotation

Scenario: Successfully create new Quotation with Quotation Template and move it to "Sales Order" state
  Given I am logged in as an "admin"
  And I am on Quotations Page
  When I click "New" button
  And I fill Quotation with Default Quotation Template and save
  And I send Quotation by email
  #And I confirm Quotation
  Then Quotation's Total Price should be valid with VAT rate 15%
  Then I should see added Quotation inside table

Scenario: Successfully create new Quotation without Quotation Template and move it to "Sales Order" state
  Given I am logged in as an "admin"
  And I am on Quotations Page
  When I click "New" button
  And I fill Quotation without Quotation Template and save
  And I send Quotation by email
  #And I confirm Quotation
  Then Quotation's Total Price should be valid with VAT rate 15%
  Then I should see added Quotation inside table