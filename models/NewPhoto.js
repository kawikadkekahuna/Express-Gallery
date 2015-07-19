module.exports = function(sequelize, DataTypes){
	var NewPhoto = sequelize.define('photo',{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		author: DataTypes.STRING,
		link: DataTypes.STRING,
		description:DataTypes.TEXT,
		created_at: DataTypes.DATE,
		updated_at: DataTypes.DATE
	},{
		underscored:true,
		tableName:'photos'
	});

	return NewPhoto;
}    