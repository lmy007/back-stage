<template>
  <div>
    <!-- breadcrumb section -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- search section -->
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- order table section -->
      <el-table :data="orderList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价钱"></el-table-column>
        <el-table-column prop="order_pay" label="是否支付">
          <template #default="scope"> <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag> <el-tag type="success" v-else>已支付</el-tag> </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template #default="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-tooltip effect="dark" content="修改地址" placement="top-start">
              <el-button type="primary" icon="el-icon-edit" circle @click="showAddressDialog"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="修改地址" placement="top-start">
              <el-button type="success" icon="el-icon-location" circle @click="showProgressDialog"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- pagenation -->
      <el-pagination @size-change="pagesizeChange" @current-change="pagenumChange" :current-page="queryInfo.pagenum" :page-sizes="[7, 10, 12, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- addressDialogue -->
    <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="40%" @close="addressDialogClose">
      <el-form :model="addressRuleForm" :rules="addressRules" ref="addressRuleFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1"> <el-cascader v-model="addressRuleForm.address1" :options="cityData" :props="{ expandTrigger: 'hover' }" @change="handleCascaderChange"></el-cascader> </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressRuleForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- ProgressDialog -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item v-for="(item, index) in progressInfo" :key="index" :timestamp="item.time">
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: 'Order',
  data() {
    return {
      orderList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      cityData,
      addressRuleForm: {
        address1: [],
        address2: ''
      },
      addressDialogVisible: false,
      progressDialogVisible: false,
      addressRules: {
        address1: [{ required: true, message: '请输入地址名称', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入地址名称', trigger: 'blur' }]
      },
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.$message.success('获取订单列表成功')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    searchOrder() {
      this.getOrderList()
    },
    // pagenation---------------------------------------
    pagesizeChange(newPagesize) {
      this.queryInfo.pagesize = newPagesize
      this.getOrderList()
    },
    pagenumChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum
      this.getOrderList()
    },
    showAddressDialog() {
      this.addressDialogVisible = true
    },
    addressDialogClose() {
      this.$refs.addressRuleFormRef.resetFields()
    },
    handleCascaderChange() {},
    showProgressDialog() {
      this.progressInfo = [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
