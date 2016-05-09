
<#assign heading>
   <form align="center">
     <h1>Welcome to the NCF contract page</h1>
     <p> To save, submit or view old contracts, please sign in. </p>
     <p> To save your completed contract press submit. To save for later, press save. </p>
   </form>
</#assign>

<#assign content>

<script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.16/browser.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.5/marked.min.js"></script>
<script src="/js/pdfobject.min.js"></script>

<div id="content"></div>
<div id="contract-id" style="display: none;">${id}</div>
<div id="display-pdf"></div>

<script type="text/babel" src="/js/contract_react.js"></script>

</#assign>

<#include "main.ftl">