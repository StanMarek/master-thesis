package meshService

import (
	"strconv"
	"strings"
)

func (service *MeshCalculationService) mapData(parsedBuffer []string) []DataMapping {
	println("Mapping data")
	var dataMapping []DataMapping

	index := 0
	for lineNumber, line := range parsedBuffer {
		isVtkLine := false
		splitLine := strings.Fields(line)
		for _, item := range splitLine {
			if _, err := strconv.ParseFloat(item, 64); err != nil {
				isVtkLine = true
			}
		}

		if isVtkLine {
			dataMapping = append(dataMapping, DataMapping{
				LineNumber: lineNumber,
				Line:       line,
				ItemIndex:  index,
			})
			index++
		}
	}

	return dataMapping
}

func (service *MeshCalculationService) extractPointsCoordinates(dataMapping []DataMapping, parsedBuffer []string) []MeshVertex {
	pointsStartLineIndex := -1
	pointsStartIndex := -1
	for index, item := range dataMapping {
		if strings.HasPrefix(item.Line, "POINTS") {
			pointsStartIndex = index
			pointsStartLineIndex = item.LineNumber
			break
		}
	}

	if pointsStartIndex == -1 {
		return nil
	}

	pointsEndIndex := pointsStartIndex + 1
	pointsEndLineIndex := dataMapping[pointsEndIndex].LineNumber

	var allPoints []string
	var pointsCoordinates []MeshVertex
	for _, line := range parsedBuffer[pointsStartLineIndex+1 : pointsEndLineIndex] {
		for _, item := range strings.Fields(line) {
			allPoints = append(allPoints, item)
		}
	}

	order := 0
	for i := 0; i < len(allPoints); i += 3 {
		x, _ := strconv.ParseFloat(allPoints[i], 64)
		y, _ := strconv.ParseFloat(allPoints[i+1], 64)
		z, _ := strconv.ParseFloat(allPoints[i+2], 64)
		pointsCoordinates = append(pointsCoordinates, MeshVertex{X: x, Y: y, Z: z, Order: order})
		order++
	}

	return pointsCoordinates
}

func (service *MeshCalculationService) createMeshCommodities(meshID string, dataMapping []DataMapping) error {

	var commodities []MeshCommodity
	for _, d := range dataMapping {
		line := d.Line
		lineNumber := d.LineNumber

		commodity := MeshCommodity{
			FileLineIndex: lineNumber,
			OriginalName:  line,
			Name:          line,
			Visible:       false,
			Tag:           UnknownTag,
		}

		for _, dc := range dataConstants {
			if strings.HasPrefix(line, dc) {
				name := ""
				for _, item := range strings.Fields(line) {
					if contains(dataConstantsName, item) {
						name = item
						break
					}
				}
				// println("Found commodity", name)
				commodity.Name = name
				commodity.Tag = dataConstantsTagMap[name]
				commodity.Visible = true
				break
			}
		}
		commodities = append(commodities, commodity)
	}
	return service.InsertMeshCommodities(meshID, commodities)
}

func (service *MeshCalculationService) createMeshVertices(meshID string, pointsCoordinates []MeshVertex) error {
	return service.InsertMeshVertices(meshID, pointsCoordinates)
}
