<template>
  <div class="detail-wrap">
    <div class="detail-left">
      <div class="product-board">
        <ul>
          <img src="../assets/images/1.png"/>
          <li v-for="itme in products">{{ itme.name }}</li>
        </ul>
      </div>
    </div>
    <div class="detail-right">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        products: [
        {
          name: '数据统计',
          path: 'count',
          active: false
        },
        {
          name: '数据预测',
          path: 'forecast',
          active: false
        },
        {
          name: '流量分析',
          path: 'analysis',
          active: false
        },
        {
          name: '广告发布',
          path: 'publish',
          active: false
        }
      ]
      }
      
    }
  }
</script>

<style scoped>

</style>
