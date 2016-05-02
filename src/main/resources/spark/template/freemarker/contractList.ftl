<#assign heading>
  <br /> <br />
  <a href="/Contract.pdf">Blank Contract</a> <br />
  <a href="/Contract_Renegotiation.pdf">Blank Renegotiation Contract</a> <br /> <br />
</#assign>


<#assign content>

  <!--
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.16/browser.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.5/marked.min.js"></script>
  -->


  <h1>Contract List</h1>
  <div id="contractList">
      
  </div>
  
  <h3 class="logged-out">Please sign in to view your contracts</h3>
  <a href="#" onclick="createContract();" id="new-contract-link" class="logged-in">New Contract</a>

  <div id="content" class="logged-in"></div>
  <script src="/js/contract_list.js"></script>

</#assign>
<#include "main.ftl">
