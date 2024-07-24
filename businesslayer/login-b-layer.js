const jwt = require('jsonwebtoken');
const loginDBLayer = require('../databaselayer/login-db-layer');
const { ACCOUNTS, STORES, USER_SECURE_DATA } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {
  generateToken(body, res) {
    return new Promise((resolve, reject) => {
      loginDBLayer.checkUserExist(body).then((data) => {
        if (data) {
          loginDBLayer
            .getSecureInfo(data._id)
            .then((sData) => {
              if (body.password === sData.password) {
                jwt.sign(
                  { user_id: data._id },
                  'hG6j!68Mgd3r!',
                  (err, token) => {
                    if (err) {
                      return reject(err);
                    }
                    resolve({
                      success: true,
                      token,
                      user_name: data.user_name,
                    });
                  },
                );
              } else {
                return res.status(404).json({
                  success: false,
                  message: 'Password not match',
                });
              }
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Username or password incorrect',
          });
        }
      });
    });
  },
  // v1(req) {
  //   return new Promise(async(resolve, reject) => {
  //     try{
  //      // let c_info = await company_info(req.get('host'));
  //       // if(c_info == null){
  //       //   return  reject("Domain name is not rgister with us")
  //       // }
  //       let response;
  //       const option = {
  //         user_name: req.body.user_name,
  //         password: req.body.password,
  //         //branch_code: body.branch_code,
  //         //company_id:ObjectId(c_info._id)
  //       };
  //       console.log(option)
  //       const query = [
  //         {
  //           $match: {
  //             email: option.user_name,
  //           //  company_id:ObjectId(c_info._id)
  //             // enabled: true,
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'UserSecureData',
  //             localField: '_id',
  //             foreignField: 'account_id',
  //             as: 'privatedata',
  //           },
  //         },
  //         {
  //           $project: {
  //             first_name: 1,
  //             last_name: 1,
  //             stores_count: 1,
  //             email: 1,
  //             password: { $arrayElemAt: [ '$privatedata.password', 0 ] },
  //             user_secure_id:{ $arrayElemAt: [ '$privatedata._id', 0 ] }
  //           },
  //         },
  //       ];
  //       console.log(JSON.stringify(query),"uguyu")
  //       getdb(ACCOUNTS)
  //       .aggregate(query)
  //       .toArray(async(err, result) => {
  //         if (err) {
  //           reject(err);
  //         }
  //         if (result.length == 1) {
  //           const user = result[0];
  //           console.log(user,"useruseruser")
  //           const passwordMatch = user.password == option.password;
  //           const token_code = {
  //             user_id: user._id,
  //           };
  //           if (!passwordMatch) {
  //             response = {
  //               success: false,
  //               message: 'Invalid credentials PW',
  //             };
  //             resolve(response);
  //           } else {
  //             try{
  //               //let branch_data = await get_branch(user,option);
  //              // let role_data = await get_roles(user);
            
  //                 const token_info = {
  //                   user: {
  //                     _id: user._id,
  //                    // display_name: user.display_name,
  //                    // mobile: user.phone_number,
  //                     email: user.email,
  //                   },
  //                   token_code
  //                 };
  //                 const token = jwt.sign(
  //                   {
  //                     token_info,
  //                   },
  //                   'hG6j!68Mgd3r!',
  //                 );
  //                 await getdb(USER_SECURE_DATA).updateOne({_id:ObjectId(user.user_secure_id)},{$set:{token:token,last_login:new Date(),logged_in:true}});
  //                 resolve({
  //                   success: true,
  //                   token,
  //                   user: {
  //                     _id: user._id,
  //                     email: user.email
  //                   },
  //                 });
  //             }catch(err){
  //               reject(err);
  //             }
  //           }
  //         } else {
  //           response = {
  //             success: false,
  //             message: 'Invalid credentials',
  //           };
  //           resolve(response);
  //         }
  //       });
  //     }catch(err){
  //       reject(err);
  //     }
  //   });
  // },
   v1(req) {
    return new Promise(async(resolve, reject) => {
      try{
        let response;
        const option = {
          user_name: req.body.user_name,
          password: req.body.password,
        };
        const query = [
          {
            $match: {
              email: option.user_name,
            },
          },
          {
            $lookup: {
              from: 'UserSecureData',
              localField: '_id',
              foreignField: 'store_id',
              as: 'privatedata',
            },
          },
          {
            $project: {
              name: 1,
              phone_number: 1,
              account_id: 1,
              email: 1,
              password: { $arrayElemAt: [ '$privatedata.password', 0 ] },
              user_secure_id:{ $arrayElemAt: [ '$privatedata._id', 0 ] },
              primary:1,
              phone_number:1,
              business_type:1
            },
          },
        ];
        getdb(STORES)
        .aggregate(query)
        .toArray(async(err, result) => {
          if (err) {
            reject(err);
          }
          if (result.length == 1) {
            const user = result[0];
            const passwordMatch = user.password == option.password;
            const token_code = {
              user_id: user._id,
            };
            if (!passwordMatch) {
              response = {
                success: false,
                message: 'Invalid credentials PW',
              };
              resolve(response);
            } else {
              try{
                const token_info = {
                  user: {
                    _id: user._id,
                    email: user.email,
                    store_id: user.store_id
                  },
                  token_code
                };
                const token = jwt.sign(
                  {
                    token_info,
                  },
                  'hG6j!68Mgd3r!',
                );
                await getdb(USER_SECURE_DATA).updateOne({_id:ObjectId(user.user_secure_id)},{$set:{token:token,last_login:new Date(),logged_in:true}});
                resolve({
                  success: true,
                  token,
                  user: {
                    _id: user._id,
                    store_id:user._id,
                    email: user.email,
                    primary:user.primary ? true:false,
                    phone_number:user.phone_number,
                    business_type:user.business_type

                  },
                });
              }catch(err){
                reject(err);
              }
            }
          } else {
            response = {
              success: false,
              message: 'Invalid credentials',
            };
            resolve(response);
          }
        });
      }catch(err){
        reject(err);
      }
    });
  },
  accountLogout(req){
    return new Promise((resolve,reject)=>{
      getdb(USER_SECURE_DATA).updateOne({_id:ObjectId(req.params.account_id),"store_id":{'$exists': false}},{$set:{token:"",logged_in:false}},(err,result)=>{
        if(err){
          return reject(err)
        }
        resolve({success:true});
      })
    })
  },
  storeLogout(req){
    return new Promise((resolve,reject)=>{
      getdb(USER_SECURE_DATA).updateOne({store_id:ObjectId(req.params.store_id)},{$set:{token:"",logged_in:false}},(err,result)=>{
        if(err){
          return reject(err)
        }
        resolve({success:true});
      })
    })
  }
};

// const company_info =(host)=>{
//   return new Promise((resolve,reject)=>{
//     console.log(host,"host host");
//     getdb(GLOBALCONFIG).findOne({"domain":host},(err,res)=>{
//       if(err){
//       reject(err);
//       }else{
//         resolve(res)
//       }
//     })
//   })
// }

// const get_roles =(user)=>{
//   return new Promise((resolve,reject)=>{
//     const role_query = [
//       {
//         $match: {
//           _id: new ObjectId(user._id),
//         },
//       },
//       {
//         $project: {
//           roles: 1,
//         },
//       },
//       {
//         $unwind: {
//           path: '$roles',
//           preserveNullAndEmptyArrays: false,
//         },
//       },{
//         $match: {
//           "roles.status":true
//         }
//       },
//       {
//         $lookup: {
//           from: 'Roles',
//           localField: 'roles.role_id',
//           foreignField: '_id',
//           as: 'roles',
//         },
//       },
//       {
//         $project: {
//           roles: {
//             $arrayElemAt: ['$roles', 0],
//           },
//         },
//       },
//       {
//         $project: {
//           'roles.role_name': 1,
//           'roles.permissions.permission_id': 1,
//           'roles.permissions.status': 1,
//         },
//       },
//       {
//         $unwind: {
//           path: '$roles.permissions',
//           preserveNullAndEmptyArrays: false,
//         },
//       },
//       {
//         $match: {
//           'roles.permissions.status': true,
//         },
//       },
//       {
//         $lookup: {
//           from: 'Permissions',
//           localField: 'roles.permissions.permission_id',
//           foreignField: '_id',
//           as: 'Permissions',
//         },
//       },
//       {
//         $unwind: {
//           path: '$Permissions',
//           preserveNullAndEmptyArrays: false,
//         },
//       },
//       {
//         $project: {
//           'role_name': '$roles.role_name',
//           'Permissions.permission_name': 1,
//         },
//       },
//       {
//         $group: {
//           _id: {
//             _id: '$_id',
//             role_name: '$role_name',
//           },
//           permissions: {
//             $push: '$Permissions.permission_name',
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           role_name: '$_id.role_name',
//           permissions: 1,
//         },
//       },
//     ];
//     getdb(USERS)
//     .aggregate(role_query)
//     .toArray((err, roles) => {
//       if (err) {
//         reject(err);
//       }
//       if (roles.length == 0) {
//         response = {
//           success: false,
//           message: 'No access permission or priviledges',
//         };
//         resolve(response);
//       } else {
//         resolve({
//           success: true,
//           roles: roles.map((role) => role.role_name),
//         });
//       }
//     });
//   })
// }
// const get_branch = (user,option)=>{
//   return new Promise((resolve,reject)=>{
//     const branch_query = [
//       {
//         $match: {
//           _id: new ObjectId(user._id),
//           company_id:ObjectId(option.company_id)
//         },
//       },
//       {
//         $unwind: {
//           path: '$branches',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $match: {
//           'branches.status': true,
//         },
//       },
//       {
//         $lookup: {
//           from: 'Branches',
//           localField: 'branches.branch_id',
//           foreignField: '_id',
//           as: 'branches',
//         },
//       },
//       {
//         $group: {
//           _id: {
//             _id: '$_id',
//           },
//           branches: {
//             $push: {
//               $arrayElemAt: ['$branches', 0],
//             },
//           },
//         },
//       },
//     ];
//     getdb(USERS)
//       .aggregate(branch_query)
//       .toArray((err, branch) => {
//         if (err) {
//           reject(err);
//         }
//         console.log(branch, 'branch');
//         if (branch.length == 0) {
//           response = {
//             success: false,
//             message: 'No branch mapped for your account',
//           };
//           resolve(response);
//         } else {
//           const index = 0;
//           let query ={
//             "branch_id":ObjectId(branch[0].branches[index]._id),
//             "company_id":ObjectId(option.company_id)
//           }
//           //const index = branch[0].branches.findIndex(
//           //   (bran) => bran.branch_code === option.branch_code,
//           // );
//           // if (index == -1) {
//           //   response = {
//           //     success: false,
//           //     message: 'No branch mapped for your account',
//           //   };
//           //   resolve(response);
//           // } else {
//             console.log(query,"hhf897jg")
//             getdb(SETTINGS).findOne(query,(err,settingData)=>{
//               if(err){
//                 reject(err);
//               }
//               resolve({success: true,branch_id:branch[0].branches[index]._id,settings:settingData})
//             });
//           // }
//         }
//       });
//   })
// }
