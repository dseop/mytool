import React from 'react';
import data from '../data.json';

const DataTable = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>확인</th>
          <th>건물종류</th>
          <th>가격</th>
          <th>소재지</th>
          <th>공급/전용면적</th>
          <th>해당층/총층</th>
          <th>방수/욕실수</th>
          <th>월관리비</th>
          <th>방향</th>
          <th>주차가능여부</th>
          <th>사용승인일</th>
          <th>총세대수</th>
          <th>총주차대수</th>
          <th>총 세대</th>
          <th>층정보</th>
          <th>주차장</th>
          <th>엘리베이터</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.MainInfo['확인']}</td>
            <td>{item.MainInfo['건물종류']}</td>
            <td>{item.MainInfo['가격']}</td>
            <td>{item['소재지']}</td>
            <td>{item['공급/전용면적']}</td>
            <td>{item['해당층/총층']}</td>
            <td>{item['방수/욕실수']}</td>
            <td>{item['월관리비']}</td>
            <td>{item['방향']}</td>
            <td>{item['주차가능여부']}</td>
            <td>{item['사용승인일']}</td>
            <td>{item['총세대수']}</td>
            <td>{item['총주차대수']}</td>
            <td>{item['총 세대']}</td>
            <td>{item['층정보']}</td>
            <td>{item['주차장']}</td>
            <td>{item['엘리베이터']}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
