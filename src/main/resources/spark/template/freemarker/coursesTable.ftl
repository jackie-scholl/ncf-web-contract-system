<table id="board1" class="board1">
    <tr>
        <td><pre>Course  </pre></td>
        <td><pre>Course name  </pre></td>
        <td><pre>Internship  </pre></td>
        <td><pre>Session  </pre></td>
        <td><pre>Name of instructor/evaluator  </pre></td>     
    </tr>
<#list 0..8 as row>
  <tr>
      <td><input type="text" id="Course number${row}" name="Course number${row}" placeholder=""></input> </td>
      <td><input type="text" id="course name${row}" name="Course name${row}" placeholder=""></input> </td>
      <td>  <input type="checkbox" id ="internship${row}" name="internship${row}" value=""></td>
      <td>  <select id = "session${row}" name="session${row}">
        <option value='A'>full term</option>
        <option value='M1'>module 1</option>
        <option value='M2'>module 2</option>
        <option value='1MC'>full term for module credit</option>
        </select> </td>
      <td><input type="text" id="instructor${row}" name="Instructor${row}" placeholder=""></input> </td>
  </tr>
</#list>
</table>
